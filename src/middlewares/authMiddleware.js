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

    // Edge Function JWT와 Render JWT 호환성 처리
    // Edge Function: { sub, email, iss: "teamitaka-api" }
    // Render Backend: { userId, email, role }
    req.user = {
      ...decoded,
      userId: decoded.userId || decoded.sub, // Edge Function의 sub를 userId로 매핑
      email: decoded.email,
      role: decoded.role || 'user'
    };

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

  // Bearer 토큰 형식 확인
  const tokenValue = token.startsWith('Bearer ') ? token.substring(7) : token;

  try {
    const decoded = jwt.verify(tokenValue, jwtSecret);

    // Edge Function JWT와 Render JWT 호환성 처리
    req.user = {
      ...decoded,
      userId: decoded.userId || decoded.sub,
      email: decoded.email,
      role: decoded.role || 'user'
    };

    // 관리자 체크
    if (!decoded.isAdmin && decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: "관리자 권한이 없습니다." });
    }

    next();
  } catch (error) {
    console.error("🚨 Auth Middleware Error:", error);
    return res.status(401).json({ error: error.message || "잘못된 토큰입니다." });
  }
};

module.exports = authenticateToken;
module.exports.authenticateToken = authenticateToken;
module.exports.adminAuth = adminAuth;