const jwt = require('jsonwebtoken');
const read = (req) => {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  try { return jwt.verify(h.slice(7), process.env.JWT_SECRET); } catch { return null; }
};
exports.auth = (req, res, next) => {
  const p = read(req);
  if (!p) return res.status(401).json({ message: 'Unauthorized' });
  req.admin = p; next();
};
exports.optionalAuth = (req, _res, next) => { req.admin = read(req); next(); };
