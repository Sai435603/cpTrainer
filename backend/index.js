require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const cron = require("node-cron");
const User = require("./models/User");
const Problem = require("./models/Problem");
const filterProblems = require("./modules/filterProblems");
const fetchRating = require("./modules/fetchRating");
const fetchUpcomingContests = require("./modules/fetchUpcomingContests");
const getStreak = require("./modules/getStreak");
const syncJob = require("./modules/syncJob");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN }));
app.use(express.json());

// —————— Mongoose Connection ——————
mongoose
  .connect("mongodb://127.0.0.1:27017/cpTrainer")
  .then(async () => {
    console.log("Database Connected In Main");
    await syncJob();
  })
  .catch((e) => {
    console.error(`Database Connection error: ${e}`);
  });

// —————— Midnight cron to refresh dailySets ——————
cron.schedule("0 0 * * *", async () => {
  console.log("Updating users' daily problem sets …");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch each user's username
  const users = await User.find({}, "username");
  await Promise.all(
    users.map(async (u) => {
      try {
        const problemsWithFlags = await filterProblems(u.username);
        // save the raw subdocs (filterProblems() already both saves and returns
        // the populated list, but here we ensure date+ids get updated)
        const userDoc = await User.findOne({ username: u.username });
        userDoc.dailySet = {
          date: today,
          problems: problemsWithFlags.map(({ problem }) => ({
            problem: problem._id,
            isSolved: false,
          })),
        };
        await userDoc.save();
      } catch (err) {
        console.error(`Error updating ${u.username}:`, err);
      }
    })
  );

  console.log("All users updated.");
});

// —————— Routes ——————

app.get("/api/problems", async (req, res) => {
  const { handle } = req.query;
  if (!handle) {
    return res.status(400).json({ error: "Missing handle" });
  }
  try {
    const list = await filterProblems(handle);
    res.json(list);
  } catch (err) {
    console.error("Error in /api/problems:", err);
    res.status(500).json({ error: "Failed to fetch problems" });
  }
});

app.get("/api/ratingGraph", async (req, res) => {
  const { handle } = req.query;
  if (!handle) {
    return res.status(400).json({ error: "Missing handle" });
  }
  try {
    const ratings = await fetchRating(handle);
    res.json(ratings);
  } catch (err) {
    console.error("Error in /api/ratingGraph:", err);
    res.status(500).json({ error: "Failed to fetch ratings" });
  }
});

app.get("/api/upcomingContests", async (req, res) => {
  try {
    const contests = await fetchUpcomingContests();
    res.json(contests);
  } catch (err) {
    console.error("Error in /api/upcomingContests:", err);
    res.status(500).json({ error: "Failed to fetch upcoming contests" });
  }
});
// in your Express setup, after importing User…

app.get("/api/streak", async (req, res) => {
  const { handle } = req.query;
  if (!handle) {
    return res.status(400).json({ error: "Missing handle" });
  }

  try {
    const user = await User.findOne({ username: handle }).populate(
      "dailySets.problems.problem"
    );

    if (!user || user.dailySets.length === 0) {
      return res.json([]);
    }

    // Map each saved day → { date: "YYYY-MM-DD", count: # solved }
    const history = user.dailySets.map((ds) => {
      const date = ds.date.toISOString().slice(0, 10);
      const count = ds.problems.filter((p) => p.isSolved).length;
      return { date, count };
    });

    res.json(history);
  } catch (err) {
    console.error("Error in /api/streak:", err);
    res.status(500).json({ error: "Failed to fetch streak history" });
  }
});

// —————— Login / Sign‑up Challenge ——————

async function generateChallengeUrl() {
  try {
    const problem = await Problem.aggregate([{ $sample: { size: 1 } }]).then(
      (arr) => arr[0]
    );
    return `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`;
  } catch {
    return "https://codeforces.com/problemset";
  }
}

function passedChallenge(subs, questionUrl) {
  if (!questionUrl) return false;
  const match = questionUrl.match(/problem\/(\d+)\/([A-Za-z0-9]+)/);
  if (!match) return false;
  const [_, wantC, wantI] = match;
  const cutoff = Math.floor(Date.now() / 1000) - 5 * 60;

  return subs.some(
    (s) =>
      s.verdict === "COMPILATION_ERROR" &&
      s.passedTestCount === 0 &&
      s.creationTimeSeconds >= cutoff &&
      s.problem.contestId.toString() === wantC &&
      s.problem.index === wantI
  );
}

async function getRecentSubmissions(handle, count = 10) {
  const url = `https://codeforces.com/api/user.status?handle=${encodeURIComponent(
    handle
  )}&from=1&count=${count}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.status === "OK" ? data.result : [];
}

app.post("/login", async (req, res) => {
  const { username, questionUrl } = req.body;
  if (!username) {
    return res.status(400).json({ message: "Username required" });
  }

  try {
    let user = await User.findOne({ username });

    // New user flow: challenge
    if (!user) {
      if (!questionUrl) {
        const url = await generateChallengeUrl();
        return res.status(401).json({
          questionUrl: url,
          message:
            "Please submit a wrong answer on test #1 of this problem within 5 minutes.",
        });
      }

      const subs = await getRecentSubmissions(username, 10);
      if (!passedChallenge(subs, questionUrl)) {
        const url = await generateChallengeUrl();
        return res.status(401).json({
          questionUrl: url,
          message: "Didn’t detect the compilation error. Please try again.",
        });
      }

      // Fetch *current* rating (last newRating in the array)
      const rtRes = await fetch(
        `https://codeforces.com/api/user.rating?handle=${encodeURIComponent(
          username
        )}`
      );
      const rtData = await rtRes.json();
      if (rtData.status !== "OK" || !rtData.result.length) {
        throw new Error("Failed to fetch initial rating");
      }

      const currentRating = rtData.result[rtData.result.length - 1].newRating;

      // Create user WITHOUT an empty dailySet
      user = await User.create({
        username,
        rating: currentRating,
        streak: 0,
      });
    }

    //  At this point, user exists
    const userStreak = await getStreak(user.username);

    return res.status(200).json({
      message: "Login successful",
      user: user.username,
      streak: userStreak,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
