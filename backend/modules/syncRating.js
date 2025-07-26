const fetch = require("node-fetch");
const User = require("../models/User"); // adjust as needed

async function fetchRating(handle) {
  const url = `https://codeforces.com/api/user.rating?handle=${handle}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch rating");
  const data = await response.json();
  return data.result;
}

async function syncRating() {
  const users = await User.find({});
  for (const user of users) {
    try {
      const ratingHistory = await fetchRating(user.username);
      user.rating = ratingHistory;
      await user.save();
      console.log(`Rating synced for ${user.usernamedle}`);
    } catch (err) {
      console.error(`Failed to sync rating for ${user.username}:`, err.message);
    }
  }
}

module.exports = syncRating;
