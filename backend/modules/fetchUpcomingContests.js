async function getCodeforcesContest() {
  const res = await fetch("https://codeforces.com/api/contest.list");
  const data = await res.json();
  const upcoming = data.result.find((contest) => contest.phase === "BEFORE");
  return {
    name: upcoming.name,
    date: new Date(upcoming.startTimeSeconds * 1000).toLocaleString(),
  };
}
async function getLeetCodeContest() {
  return {
    name: "Weekly-Contest 143",
    date: new Date().toLocaleString(),
  };
}


async function getCodeChefContest() {
  const res = await fetch("https://www.codechef.com/api/list/contests/all");
  const data = await res.json();
  const upcoming = data.future_contests[0];
  return {
    name: upcoming.contest_name,
    date: new Date(upcoming.contest_start_date_iso).toLocaleString(),
  };
}

async function fetchUpcomingContests() {
  const codeforces = await getCodeforcesContest();
  const codechef = await getCodeChefContest();
  const leetcode = await getLeetCodeContest();
  const data = {
    codeforcesContest: codeforces,
    codechefContest: codechef,
    leetcodeContest: leetcode,
  };
  return data;
}

module.exports = fetchUpcomingContests;
