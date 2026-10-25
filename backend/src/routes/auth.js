const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Admin = require('../models/Admin');
const { auth } = require('../middleware/auth');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { message: 'Too many attempts, try again later' } });

router.post('/login', limiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: String(email || '').toLowerCase() });
    if (!admin || !(await bcrypt.compare(String(password || ''), admin.password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ token, email: admin.email });
  } catch (e) { next(e); }
});

router.get('/me', auth, (req, res) => res.json({ email: req.admin.email }));
module.exports = router;
