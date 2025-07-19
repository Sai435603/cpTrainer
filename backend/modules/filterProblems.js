const fetch     = require("node-fetch");
const mongoose  = require("mongoose");
const Problem   = require("../models/Problem");
const User      = require("../models/User");

// helper to check if two Dates are the same calendar day
function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth()    === d2.getMonth() &&
    d1.getDate()     === d2.getDate()
  );
}

async function pickFromBucket(solvedKeys, { offset, count }, rating) {
  const lower = rating + offset - 25;
  const upper = rating + offset + 25;

  return Problem.aggregate([
    { $match: { rating: { $gte: lower, $lte: upper }, contestId: { $exists: true } } },
    {
      $match: {
        $expr: {
          $not: {
            $in: [
              { $concat: [{ $toString: "$contestId" }, "-", "$index"] },
              solvedKeys
            ]
          }
        }
      }
    },
    { $sample: { size: count } }
  ]);
}

async function filterProblems(handle) {
  // 0. Load (or create) User
  let user = await User.findOne({ username: handle });
  if (!user) {
    // if user is new, initialize with zero rating
    user = new User({ username: handle, rating: 0, dailySet: null });
  }

  const today = new Date();
  if (user.dailySet && isSameDay(user.dailySet.date, today)) {
    // Already have today's assignment → just return those Problems
    return Problem.find({ _id: { $in: user.dailySet.problems } });
  }

  // Use stored rating from DB
  const rating = user.rating || 800;

  // 1. Fetch user submissions to build solvedKeys
  const statusRes  = await fetch(
    `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}`
  );
  const statusData = await statusRes.json();
  if (statusData.status !== "OK")
    throw new Error(`user.status failed: ${statusData.comment || "unknown"}`);

  const solvedKeys = statusData.result
    .filter(s => s.verdict === "OK" && s.problem.contestId)
    .map(s => `${s.problem.contestId}-${s.problem.index}`);

  // 2. Define buckets
  const buckets = [
    { offset: -200, count: 1 },
    { offset: -100, count: 2 },
    { offset:    0, count: 2 },
    { offset:  100, count: 2 },
    { offset:  200, count: 2 },
    { offset:  300, count: 1 }
  ];

  // 3. Run all bucket queries in parallel
  const picks = await Promise.all(
    buckets.map(b => pickFromBucket(solvedKeys, b, rating))
  );

  // 4. Flatten & trim to 10
  const problems = picks.flat().slice(0, 10);

  // 5. Update user's dailySet and save
  user.dailySet = {
    date: today,
    problems: problems.map(p => p._id)
  };
  await user.save();

  return problems;
}

module.exports = filterProblems;
