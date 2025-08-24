const buckets = new Map();

function keyFor(req, name) {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const email = req.body?.email || '';
  return `${name}:${ip}:${email}`;
}

exports.simpleRateLimit = function simpleRateLimit({ windowMs = 15 * 60 * 1000, max = 5 }) {
  return (req, res, next) => {
    const now = Date.now();
    const key = keyFor(req, req.route?.path || 'default');
    const arr = buckets.get(key) || [];
    const fresh = arr.filter((t) => now - t < windowMs);
    if (fresh.length >= max) {
      return res.status(429).json({ error: 'Too many requests, please try later.' });
    }
    fresh.push(now);
    buckets.set(key, fresh);
    next();
  };
};


