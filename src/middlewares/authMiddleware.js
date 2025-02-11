const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("Authorization");
  
  if (!token) {
    return res.status(401).json({ error: "관리자 인증이 필요합니다." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).json({ error: "관리자 권한이 없습니다." });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "잘못된 토큰입니다." });
  }
};
