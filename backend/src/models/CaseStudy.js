const mongoose = require('mongoose');
module.exports = mongoose.model('CaseStudy', new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, index: true },
  category: { type: String, default: 'Project' },             // Case study, Open source, Client work, Personal…
  eyebrow: { type: String, default: '' },                    // short label e.g. Fintech · Production
  image: { type: String, default: '' },                      // optional cover image URL
  featured: { type: Boolean, default: true },                // show on the home page
  subtitle: { type: String, default: '' },
  summary: { type: String, default: '' },
  content: { type: String, default: '' },
  stack: [String],
  highlights: [String],
  github: String, demo: String, docs: String,
  published: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true }));
