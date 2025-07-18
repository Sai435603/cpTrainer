const filterProblems = require("./modules/filterProblems");
const fetchRating = require("./modules/fetchRating");
const fetchUpcomingContests = require("./modules/fetchUpcomingContests");
const syncJob = require("./modules/syncJob");
const User = require("./models/User");
const Problem = require("./models/Problem");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const app = express();

dotenv.config();
const frontendOrigin = process.env.FRONTEND_ORIGIN;
const PORT = process.env.PORT || 3000;
app.use(cors({ origin: frontendOrigin }));
app.use(express.json());
mongoose
  .connect("mongodb://127.0.0.1:27017/cpTrainer")
  .then(async () => {
    console.log("Database Connected In Main");
    //Fetch in the start once
    await syncJob();
  })
  .catch((e) => {
    console.log(`Database Connection error: ${e}`);
  });

app.get("/api/problems", async (req, res) => {
  const handle = req.query.handle;
  if (!handle) {
    return res.status(400).json({ error: "Missing handle" });
  }
  console.log(`Fetching problems for user: ${handle}`);
  try {
    const problems = await filterProblems(handle);
    res.json(problems);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to fetch problems" });
  }
});

app.get("/api/ratingGraph", async (req, res) => {
  const handle = req.query.handle;
  if (!handle) {
    return res.status(400).json({ error: "Missing handle" });
  }
  console.log(`Fetching Rating of user: ${handle}`);
  try {
    const ratings = await fetchRating(handle);
    res.json(ratings);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to fetch ratings" });
  }
});

app.get("/api/upcomingContests", async (req, res) => {
  console.log(`Fetching Upcoming Contests`);
  try {
    const contests = await fetchUpcomingContests();
    res.json(contests);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to fetch Upcoming Contests" });
  }
});

// LOGIN Code Start Here
// Utility: fetch recent submissions for a handle using native fetch
async function generateChallengeUrl() {
  try {
    const problem = await getRandomProblem();
    return `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`;
  } catch (err) {
    console.warn("Could not fetch random problem, defaulting to problemset");
    return "https://codeforces.com/problemset";
  }
}
// Fetch a random problem from the Problems collection
async function getRandomProblem() {
  const [random] = await Problem.aggregate([{ $sample: { size: 1 } }]);
  return random; // expects fields { contestId, index }
}

function passedChallenge(subs, questionUrl) {
  if (!questionUrl) return false;

  // extract contestId and index from URL, e.g. "/problem/1234/A"
  const match = questionUrl.match(/problem\/(\d+)\/([A-Za-z0-9]+)/);
  if (!match) return false;
  const [_, wantedContestId, wantedIndex] = match.map((v) => v.toString());

  const now = Math.floor(Date.now() / 1000);
  const cutoff = now - 5 * 60;

  return subs.some((s) => {
    const p = s.problem;
    return (
      s.verdict === "WRONG_ANSWER" &&
      s.passedTestCount === 0 &&
      s.creationTimeSeconds >= cutoff &&
      p.contestId.toString() === wantedContestId &&
      p.index === wantedIndex
    );
  });
}

async function getRecentSubmissions(handle, count = 10) {
  const url = `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle
  )}&from=1&count=${count}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "CP-Trainer-App/1.0",
    },
    redirect: "follow",
  });
  if (!response.ok) {
    console.error(`CF API responded with HTTP ${response.status}`);
    return [];
  }
  const data = await response.json();
  if (data.status !== "OK") {
    console.error(`CF API error: ${data.comment || "No comment"}`);
    return [];
  }
  return data.result;
}


app.post("/login", async (req, res) => {
  const { username, questionUrl } = req.body;
  if (!username) {
    return res.status(400).json({ message: "Username required" });
  }

  try {
    let user = await User.findOne({ username });

    // If user doesn't exist, we need to issue (or verify) a challenge
    if (!user) {
      // No challenge URL submitted yet → issue a new one
      if (!questionUrl) {
        const newUrl = await generateChallengeUrl();
        return res.status(401).json({
          questionUrl: newUrl,
          message: "Please submit a wrong answer on test 1 of this problem within the next 5 minutes to prove your handle."
        });
      }

      // A challenge URL *was* submitted → check their recent CF submissions
      const subs = await getRecentSubmissions(username, 10);
      if (!passedChallenge(subs, questionUrl)) {
        // Failed the check → issue another challenge
        const newUrl = await generateChallengeUrl();
        return res.status(401).json({
          questionUrl: newUrl,
          message: "Didn't detect a WRONG_ANSWER on test 1. Please try again with this new problem."
        });
      }

      // Challenge passed → create the user record
      user = await User.create({ username });
    }

    // At this point, user exists (either pre‑existing or just created)
    return res.status(200).json({
      message: "Login successful",
      user: { username: user.username }
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
