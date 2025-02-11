const jwt = require("jsonwebtoken");
const { jwtSecret, adminEmail } = require("../config/authConfig");

exports.verifyAdmin = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ error: "관리자 인증이 필요합니다." });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded.email !== adminEmail) {
      return res.status(403).json({ error: "관리자 전용 API입니다." });
    }
    req.admin = decoded; // 요청 객체에 관리자 정보 저장
    next();
  } catch (error) {
    return res.status(403).json({ error: "유효하지 않은 토큰입니다." });
  }
};
