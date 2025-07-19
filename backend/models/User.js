const mongoose = require("mongoose");

const DailySetSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  rating: { type: Number, default: 800 },
  dailySet: DailySetSchema,
});

module.exports = mongoose.model("User", UserSchema);
