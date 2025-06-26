const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/authConfig");

// 일반 인증 미들웨어 (관리자 권한 불필요)
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    console.log("🚨 Auth Middleware: No token provided");
    return res.status(401).json({ error: "인증이 필요합니다." });
  }

  // Bearer 토큰 형식 확인
  if (!token.startsWith('Bearer ')) {
    console.log("🚨 Auth Middleware: Invalid token format (should start with 'Bearer ')");
    return res.status(401).json({ error: "잘못된 토큰 형식입니다." });
  }

  const tokenValue = token.substring(7); // "Bearer " 제거
  console.log("🔐 Auth Middleware: Token received:", tokenValue.substring(0, 50) + "...");
  console.log("🔐 Auth Middleware: JWT Secret:", jwtSecret ? "SET" : "NOT SET");

  try {
    const decoded = jwt.verify(tokenValue, jwtSecret);
    console.log("✅ Auth Middleware: Token verified successfully");
    console.log("✅ Auth Middleware: Decoded payload:", JSON.stringify(decoded, null, 2));
    req.user = decoded;
    next();
  } catch (error) {
    console.error("🚨 Auth Middleware Error:", error.message);
    console.error("🚨 Auth Middleware Error Details:", error);
    return res.status(401).json({ error: "invalid token" });
  }
};

// 관리자 인증 미들웨어 (관리자 권한 필요)
const adminAuth = (req, res, next) => {
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

module.exports = authenticateToken;
module.exports.authenticateToken = authenticateToken;
module.exports.adminAuth = adminAuth;