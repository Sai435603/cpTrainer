const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema({
  handle: { type: String, required: true },
  contestName: String,
  rating: Number,
  rank: Number,
  date: String,
});

module.exports = mongoose.model("Rating", RatingSchema);
