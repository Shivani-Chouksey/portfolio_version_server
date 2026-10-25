const mongoose = require('mongoose');
module.exports = mongoose.model('Skill', new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, default: 'General' },
  order: { type: Number, default: 0 },
}, { timestamps: true }));
