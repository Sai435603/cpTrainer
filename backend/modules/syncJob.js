const cron = require("node-cron");
const syncProblems = require("./syncProblems");
function syncJob() {  
  // Every 3 days at midnight
  // console.log("syncJob module called");
  cron.schedule("0 0 */3 * *", () => {
    console.log("Running scheduled sync...");
    syncProblems().catch(console.error);
  });
}

module.exports = syncJob;
