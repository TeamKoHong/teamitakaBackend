const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/authConfig");
const { Admin } = require("../models"); // 모델 가져오기

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // DB에서 관리자 조회
    const admin = await Admin.findOne({ where: { email } });
    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).json({ error: "관리자 계정이 아닙니다." });
    }

    // 비밀번호 비교
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "비밀번호가 올바르지 않습니다." });
    }

    // JWT 발급
    const token = jwt.sign({ email, role: "ADMIN" }, jwtSecret, { expiresIn: "12h" });
    res.json({ token, message: "관리자 로그인 성공" });
  } catch (error) {
    console.error("🚨 관리자 로그인 오류:", error.message);
    res.status(500).json({ error: "서버 오류: 로그인 실패" });
  }
};

module.exports = {
  loginAdmin,
  getCertifiedUsers,
  clearVerifiedEmails,
};