const jwt = require("jsonwebtoken");
const { jwtSecret, jwtIssuer } = require("../config/authConfig");

// 일반 인증 미들웨어 (관리자 권한 불필요)
const authenticateToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const cookieToken = req.cookies?.token;
  const token = authHeader || (cookieToken ? `Bearer ${cookieToken}` : null);

  if (!token) {
    console.log("🚨 Auth Middleware: No token provided");
    return res.status(401).json({ error: "인증이 필요합니다." });
  }

  // Bearer 토큰 형식 확인
  if (!token.startsWith('Bearer ')) {
    return res.status(401).json({ error: "잘못된 토큰 형식입니다." });
  }

  const tokenValue = token.substring(7); // "Bearer " 제거

  try {
    const decoded = jwt.verify(tokenValue, jwtSecret, { issuer: jwtIssuer });

    // Edge Function JWT와 Render JWT 호환성 처리
    // Edge Function: { sub, email, iss: "teamitaka-api" }
    // Render Backend: { userId, email, role }
    req.user = {
      ...decoded,
      userId: decoded.userId || decoded.sub, // Edge Function의 sub를 userId로 매핑
      email: decoded.email,
      role: decoded.role || 'user'
    };

    if (!req.user.userId) {
      return res.status(401).json({ error: "invalid token" });
    }

    next();
  } catch (error) {
    console.error("🚨 Auth Middleware Error:", error.message);
    return res.status(401).json({ error: "invalid token" });
  }
};

// 관리자 인증 미들웨어 (관리자 권한 필요)
const adminAuth = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const cookieToken = req.cookies?.token;
  const token = authHeader || (cookieToken ? `Bearer ${cookieToken}` : null);

  if (!token) {
    return res.status(401).json({ error: "인증이 필요합니다." });
  }

  // Bearer 토큰 형식 확인
  const tokenValue = token.startsWith('Bearer ') ? token.substring(7) : token;

  try {
    const decoded = jwt.verify(tokenValue, jwtSecret, { issuer: jwtIssuer });

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

// 전화번호 인증 필수 미들웨어 (phone_verified 필요)
const requirePhoneVerified = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const cookieToken = req.cookies?.token;
  const token = authHeader || (cookieToken ? `Bearer ${cookieToken}` : null);

  if (!token) {
    return res.status(401).json({ error: "인증이 필요합니다." });
  }

  // Bearer 토큰 형식 확인
  const tokenValue = token.startsWith('Bearer ') ? token.substring(7) : token;

  try {
    const decoded = jwt.verify(tokenValue, jwtSecret, { issuer: jwtIssuer });

    // Edge Function JWT와 Render JWT 호환성 처리
    req.user = {
      ...decoded,
      userId: decoded.userId || decoded.sub,
      email: decoded.email,
      role: decoded.role || 'user'
    };

    if (!req.user.userId) {
      return res.status(401).json({ error: "잘못된 토큰입니다." });
    }

    // 사용자 전화번호 인증 상태 확인
    const { User } = require("../models");
    const user = await User.findByPk(req.user.userId, {
      attributes: ["phone_verified"]
    });

    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    if (!user.phone_verified) {
      return res.status(403).json({
        error: "전화번호 인증이 필요합니다.",
        requirePhoneVerification: true
      });
    }

    next();
  } catch (error) {
    console.error("🚨 Phone Verification Middleware Error:", error);
    return res.status(401).json({ error: error.message || "잘못된 토큰입니다." });
  }
};

module.exports = authenticateToken;
module.exports.authenticateToken = authenticateToken;
module.exports.adminAuth = adminAuth;
module.exports.requirePhoneVerified = requirePhoneVerified;
