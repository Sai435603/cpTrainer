const mongoose = require("mongoose");

const DailyProblemSchema = new mongoose.Schema({
  problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
  isSolved: { type: Boolean, default: false },
});

const DailySetSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  problems: [DailyProblemSchema], // array of subdocuments
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  rating: { type: Number, default: 800 },
  dailySets: [DailySetSchema],
  streak: { type: Number, default: 0 },
});

module.exports = mongoose.model("User", UserSchema);
