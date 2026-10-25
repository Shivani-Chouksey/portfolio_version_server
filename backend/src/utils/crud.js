const express = require('express');
const mongoose = require('mongoose');
const { auth, optionalAuth } = require('../middleware/auth');

const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/**
 * Generic CRUD router.
 * Public: GET / and GET /:idOrSlug (only publicFilter docs).
 * Admin (Bearer token): GET /?all=1 sees everything; POST, PUT, DELETE.
 */
module.exports = (Model, { sort = { order: 1, createdAt: -1 }, publicFilter = { published: true }, slugField } = {}) => {
  const r = express.Router();

  r.get('/', optionalAuth, async (req, res, next) => {
    try {
      const q = req.admin && req.query.all === '1' ? {} : { ...publicFilter };
      if (req.query.category) q.category = req.query.category;
      if (req.query.subject) q.subject = req.query.subject;
      res.json(await Model.find(q).sort(sort).lean());
    } catch (e) { next(e); }
  });

  r.get('/:idOrSlug', optionalAuth, async (req, res, next) => {
    try {
      const { idOrSlug } = req.params;
      const base = req.admin ? {} : { ...publicFilter };
      const q = slugField && !mongoose.isValidObjectId(idOrSlug) ? { ...base, slug: idOrSlug } : { ...base, _id: idOrSlug };
      const doc = await Model.findOne(q).lean();
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json(doc);
    } catch (e) { next(e); }
  });

  r.post('/', auth, async (req, res, next) => {
    try {
      const body = { ...req.body };
      if (slugField) body.slug = slugify(body.slug || body[slugField] || '');
      res.status(201).json(await Model.create(body));
    } catch (e) { next(e); }
  });

  r.put('/:id', auth, async (req, res, next) => {
    try {
      const body = { ...req.body };
      delete body._id;
      if (slugField && body.slug) body.slug = slugify(body.slug);
      const doc = await Model.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json(doc);
    } catch (e) { next(e); }
  });

  r.delete('/:id', auth, async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json({ ok: true });
    } catch (e) { next(e); }
  });

  return r;
};
