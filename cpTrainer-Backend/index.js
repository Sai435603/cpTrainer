const filterProblems = require("./filterProblems");
const fetchRating = require("./fetchRating");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const app = express();
dotenv.config();
const frontendOrigin = process.env.FRONTEND_ORIGIN;
const PORT = process.env.PORT || 3000;
app.use(cors({ origin: frontendOrigin }));

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

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
