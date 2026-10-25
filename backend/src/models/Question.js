const mongoose = require('mongoose');
module.exports = mongoose.model('Question', new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  answer: { type: String, default: '' },
  category: { type: String, default: 'General' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  tags: [String],
  published: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true }));
