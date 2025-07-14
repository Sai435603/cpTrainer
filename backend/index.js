const filterProblems = require("./modules/filterProblems");
const fetchRating = require("./modules/fetchRating");
const fetchUpcomingContests = require("./modules/fetchUpcomingContests");
const syncJob = require("./modules/syncJob");
const syncProblems = require("./modules/syncProblems");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = express();

dotenv.config();
const frontendOrigin = process.env.FRONTEND_ORIGIN;
const PORT = process.env.PORT || 3000;
app.use(cors({ origin: frontendOrigin }));

mongoose
  .connect("mongodb://127.0.0.1:27017/cptrainer")
  .then(async () => {
    console.log("Database Connected In Main");
    //Fetch in the start once
    syncJob();
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

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
