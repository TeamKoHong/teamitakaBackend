const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/authConfig");

const optionalAuthMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token || !token.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const tokenValue = token.substring(7);

  try {
    const decoded = jwt.verify(tokenValue, jwtSecret);
    req.user = {
      ...decoded,
      userId: decoded.userId || decoded.sub,
      email: decoded.email,
      role: decoded.role || 'user'
    };
  } catch (error) {
    req.user = null;
  }

  next();
};

module.exports = optionalAuthMiddleware;
