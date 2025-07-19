const Problem = require("../models/Problem");
const fetchAllProblems = require("./fetchCodeforcesProblems");
async function syncProblems(state) {
  
  const problems = await fetchAllProblems();
  const bulkOps = problems.map((p) => ({
    updateOne: {
      filter: { contestId: p.contestId, index: p.index },
      update: { $set: p },
      upsert: true,
    },
  }));

  await Problem.bulkWrite(bulkOps);
  console.log(`Synced ${bulkOps.length} problems.`);
}

module.exports = syncProblems;
