const fetch = require("node-fetch");
async function fetchCodeforcesProblems() {
  try {
    const response = await fetch("https://codeforces.com/api/problemset.problems");
    const data = await response.json();
    if (data.status !== "OK") throw new Error("Failed to fetch CF problems");
    const problems = data.result.problems;
    return problems;
  }
  catch(e){
     console.log(`fetchCodeforcesProblems module failed due to ${e.Error}.`);
  }
}
module.exports = fetchCodeforcesProblems;