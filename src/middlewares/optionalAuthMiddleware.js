const jwt = require("jsonwebtoken");
const { jwtSecret, jwtIssuer } = require("../config/authConfig");

const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const cookieToken = req.cookies?.token;
  const token = authHeader || (cookieToken ? `Bearer ${cookieToken}` : null);

  if (!token || !token.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const tokenValue = token.substring(7);

  try {
    const decoded = jwt.verify(tokenValue, jwtSecret, { issuer: jwtIssuer });
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
