const fetch = require("node-fetch");
const User = require("../models/User"); // adjust as needed

async function fetchRating(handle) {
  const url = `https://codeforces.com/api/user.rating?handle=${handle}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch rating");
  const data = await response.json();
  return data.result; // array of contest rating changes
}

async function syncRating() {
  const users = await User.find({});
  for (const user of users) {
    try {
      const ratingHistory = await fetchRating(user.handle);
      user.rating = ratingHistory;
      await user.save();
      console.log(`Rating synced for ${user.handle}`);
    } catch (err) {
      console.error(`Failed to sync rating for ${user.handle}:`, err.message);
    }
  }
}

module.exports = syncRating;
