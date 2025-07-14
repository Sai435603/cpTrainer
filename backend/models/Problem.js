const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  contestId: Number,
  index: String,
  name: String,
  type: String,
  rating: Number,
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('Problem', ProblemSchema);