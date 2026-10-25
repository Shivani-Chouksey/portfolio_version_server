const mongoose = require('mongoose');
module.exports = mongoose.model('Note', new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, index: true },
  subject: { type: String, default: 'General' },
  status: { type: String, enum: ['upcoming', 'in-progress', 'published'], default: 'in-progress' },
  excerpt: { type: String, default: '' },
  content: { type: String, default: '' },
  tags: [String],
  readTime: { type: Number, default: 5 },
  order: { type: Number, default: 0 },
}, { timestamps: true }));
