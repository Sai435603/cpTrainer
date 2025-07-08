// backend/filterProblems.js
const fetch = require("node-fetch");

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
  // 1. Get user rating
  const resUser = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
  const userData = await resUser.json();
  if (userData.status !== "OK") {
    throw new Error(`User.info failed: ${userData.comment || "unknown error"}`);
  }
  const rating = userData.result[0].rating;

  // 2. Fetch all problems
  const problemRes = await fetch("https://codeforces.com/api/problemset.problems");
  const problemData = await problemRes.json();
  const allProblems = problemData.result.problems;

  // 3. Fetch user submissions
  const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${handle}`);
  const statusData = await statusRes.json();

  // 4. Build solved-set
  const solvedSet = new Set();
  for (const sub of statusData.result) {
    if (sub.verdict === "OK") {
      solvedSet.add(`${sub.problem.contestId}-${sub.problem.index}`);
    }
  }

  // 5. Filter unsolved
  const unsolved = allProblems.filter(p => {
    if (!p.contestId || !p.index || !p.rating) return false;
    return !solvedSet.has(`${p.contestId}-${p.index}`);
  });

  // 6. Buckets for balanced difficulty
  const buckets = [
    { offset: -200, count: 1 },
    { offset: -100, count: 2 },
    { offset:    0, count: 2 },
    { offset:  100, count: 2 },
    { offset:  200, count: 2 },
    { offset:  300, count: 1 },
  ];

  const selected = [];
  for (const { offset, count } of buckets) {
    const target = rating + offset;
    const candidates = unsolved.filter(p =>
      p.rating >= target - 25 && p.rating <= target + 25
    );
    selected.push(...pickRandom(candidates, count));
  }

  return selected.slice(0, 10);
}

module.exports = filterProblems;
