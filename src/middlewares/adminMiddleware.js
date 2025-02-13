const jwt = require("jsonwebtoken");
require("dotenv").config();

const adminMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "❌ 인증 토큰이 필요합니다." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "ADMIN") {
      return res.status(403).json({ message: "🚫 관리자 권한이 필요합니다." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "❌ 유효하지 않은 토큰입니다." });
  }
};

module.exports = adminMiddleware;
