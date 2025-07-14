const mongoose = require('mongoose');

const RatingHistorySchema = new mongoose.Schema({
  handle:    { type: String, required: true },
  date:      { type: Date,   required: true },
  rating:    { type: Number, required: true },
}, {
  timestamps: true
});

// Ensure only one entry per user per day
RatingHistorySchema.index({ handle: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('RatingHistory', RatingHistorySchema);