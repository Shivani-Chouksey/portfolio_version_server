module.exports = (err, _req, res, _next) => {
  if (err.code === 11000) return res.status(409).json({ message: 'A record with this title/slug already exists' });
  if (err.name === 'ValidationError') return res.status(422).json({ message: Object.values(err.errors).map(e => e.message).join(', ') });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id' });
  console.error(err);
  res.status(500).json({ message: 'Server error' });
};
