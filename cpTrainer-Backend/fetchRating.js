const fetch = require("node-fetch");
async function fetchRating(handle) {
  const ratings = await fetch(
    `https://codeforces.com/api/user.rating?handle=${handle}`
  );
  const rating = await ratings.json();
  
  const formatted = rating.result.map((d) => ({
    date: new Date(d.ratingUpdateTimeSeconds * 1000).toLocaleDateString(
      "en-US",
      {
        month: "short",
        year: "numeric",
      }
    ),
    contestName: d.contestName,
    rating: d.newRating,
    rank: d.rank,
  }));
  return formatted;
}

module.exports = fetchRating;
