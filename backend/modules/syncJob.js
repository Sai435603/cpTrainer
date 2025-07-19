const fs = require("fs/promises");
const path = require("path");
const cron = require("node-cron");

const syncProblems = require("./syncProblems"); // adjust path if needed
const syncRating = require("./syncRating");
console.log(__dirname);
const stateFile = path.resolve(__dirname, "state.json");

async function loadState() {
  try {
    const raw = await fs.readFile(stateFile, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return null; // file not found → first run
    throw err; // JSON parse or other error
  }
}

/** Persist state.json prettified */
async function saveState(state) {
  await fs.writeFile(stateFile, JSON.stringify(state, null, 2), "utf8");
}

async function syncJob() {
  let state = await loadState();
  if (state?.firstSync) {
    console.log("First sync already done. Running sync based on stored state…");
    await syncProblems().catch(console.error);
    await syncRating().catch(console.error);
  } else {
    console.log("Running first-time sync…");
    await syncProblems().catch(console.error);
    await syncRating().catch(console.error);
    // mark first sync complete
    state = { firstSync: true };
    await saveState().catch(console.error);
    console.log("State file written.");
  }

  // schedule: every 3 days at 00:00
  cron.schedule("0 0 */3 * *", () => {
    console.log("Running scheduled sync…");
    syncProblems().catch(console.error);
    syncRating().catch(console.error);
  });
}

module.exports = syncJob;
// const cron = require("node-cron");
// const syncProblems = require("./syncProblems");
// async function syncJob() {
//   // Every 3 days at midnight
//   // console.log("syncJob module called");
//   await syncProblems().catch(console.error);

//   cron.schedule("0 0 */3 * *", () => {
//     console.log("Running scheduled sync...");
//     syncProblems().catch(console.error);
//   });
// }

// module.exports = syncJob;

// --------------------------------------------------
// check this
// syncJob.js
