// backend/filterProblems.js
const fetch = require("node-fetch");
const mongoose = require("mongoose");
const Problem = require("../models/Problem");

function pickRandom(arr, count) {
  const used = new Set();
  const selected = [];
  while (selected.length < count && used.size < arr.length) {
    const idx = Math.floor(Math.random() * arr.length);
    if (used.has(idx)) continue;
    used.add(idx);
    selected.push(arr[idx]);
  }
  return selected;
}

async function filterProblems(handle) {
  // ——— 1. Get user rating
  const resUser = await fetch(
    `https://codeforces.com/api/user.info?handles=${handle}`
  );

  const userData = await resUser.json();
  if (userData.status !== "OK") {
    throw new Error(`User.info failed: ${userData.comment || "unknown error"}`);
  }
  const rating = userData.result[0].rating;

  // ——— 2. Get user submissions
  const statusRes = await fetch(
    `https://codeforces.com/api/user.status?handle=${handle}`
  );
  const statusData = await statusRes.json();
  if (statusData.status !== "OK") {
    throw new Error(
      `User.status failed: ${statusData.comment || "unknown error"}`
    );
  }

  // ——— 3. Build solved set
  const solvedSet = new Set();
  for (const sub of statusData.result) {
    if (sub.verdict === "OK" && sub.problem.contestId && sub.problem.index) {
      solvedSet.add(`${sub.problem.contestId}-${sub.problem.index}`);
    }
  }
  // ——— 4. Pull ALL problems from your local DB
  const allProblems = await Problem.find();
  // console.log(allProblems);
  // ——— 5. Filter out solved
  const unsolved = allProblems.filter(
    (p) => !solvedSet.has(`${p.contestId}-${p.index}`)
  );
  // ——— 6. Define buckets
  const buckets = [
    { offset: -200, count: 1 },
    { offset: -100, count: 2 },
    { offset:    0, count: 2 },
    { offset:  100, count: 2 },
    { offset:  200, count: 2 },
    { offset:  300, count: 1 },
  ];

  // ——— 7. Pick random from each bucket
  const selected = [];
  for (const { offset, count } of buckets) {
    const target = rating + offset;
    const candidates = unsolved.filter(
      (p) => p.rating >= target - 25 && p.rating <= target + 25
    );
    selected.push(...pickRandom(candidates, count));
  }

  // ——— 8. Return up to 10
  const result = selected.slice(0, 10);
  console.log(`filterProblems(${handle}) → ${result.length} problems`);
  return result;
}

module.exports = filterProblems;
