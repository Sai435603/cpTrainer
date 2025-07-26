const fetch = require("node-fetch");
const mongoose = require("mongoose");
const Problem = require("../models/Problem");
const User = require("../models/User");

// helper to check if two Dates are the same calendar day
function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

async function pickFromBucket(solvedKeys, { offset, count }, rating) {
  const lower = rating + offset - 25;
  const upper = rating + offset + 25;

  return Problem.aggregate([
    {
      $match: {
        rating: { $gte: lower, $lte: upper },
        contestId: { $exists: true },
      },
    },
    {
      $match: {
        $expr: {
          $not: {
            $in: [
              { $concat: [{ $toString: "$contestId" }, "-", "$index"] },
              solvedKeys,
            ],
          },
        },
      },
    },
    { $sample: { size: count } },
  ]);
}

async function filterProblems(handle) {
  // 0. Load (or create) User, populating subdocs
  let user = await User.findOne({ username: handle }).populate(
    "dailySets.problems.problem"
  );

  if (!user) {
    user = new User({
      username: handle,
      rating: 800,
      streak: 0,
      dailySets: [],
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. If last dailySet is today, just return it
  const lastSet = user.dailySets[0];
  if (lastSet && isSameDay(lastSet.date, today)) {
    return lastSet.problems.map(({ problem, isSolved }) => ({
      problem,
      isSolved,
    }));
  }

  // 2. Otherwise, pick fresh problems
  const rating = user.rating || 800;

  const statusRes = await fetch(
    `https://codeforces.com/api/user.status?handle=${encodeURIComponent(
      handle
    )}`
  );
  const statusData = await statusRes.json();
  if (statusData.status !== "OK")
    throw new Error(`user.status failed: ${statusData.comment || "unknown"}`);

  const solvedKeys = statusData.result
    .filter((s) => s.verdict === "OK" && s.problem.contestId)
    .map((s) => `${s.problem.contestId}-${s.problem.index}`);

  const buckets = [
    { offset: -200, count: 1 },
    { offset: -100, count: 2 },
    { offset: 0, count: 2 },
    { offset: 100, count: 2 },
    { offset: 200, count: 2 },
    { offset: 300, count: 1 },
  ];

  const picks = await Promise.all(
    buckets.map((b) => pickFromBucket(solvedKeys, b, rating))
  );
  const problems = picks.flat().slice(0, 10);

  // 3. Push new dailySet onto the history
  user.dailySets.unshift({
    date: today,
    problems: problems.map((p) => ({
      problem: p._id,
      isSolved: false,
    })),
  });

  await user.save();

  // 4. Return the new set
  return problems.map((p) => ({
    problem: p,
    isSolved: false,
  }));
}

module.exports = filterProblems;
