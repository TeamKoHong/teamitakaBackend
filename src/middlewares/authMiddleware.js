const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/authConfig");

module.exports = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "인증이 필요합니다." });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    // 관리자 체크는 선택적으로 유지
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: "관리자 권한이 없습니다." });
    }

    req.user = decoded; // req.admin 대신 req.user로 변경
    next();
  } catch (error) {
    console.error("🚨 Auth Middleware Error:", error);
    return res.status(401).json({ error: error.message || "잘못된 토큰입니다." });
  }
};