const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { jwtSecret, jwtIssuer } = require("../config/authConfig"); // adminEmail, adminPassword 제거
const axios = require("axios");
const { VerifiedEmail, Admin } = require("../models"); // Admin 모델 추가

// 🔐 관리자 로그인
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // DB에서 관리자 계정 조회
    const admin = await Admin.findOne({ where: { email } });
    if (!admin || admin.role !== "ADMIN") {
      return res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    // 비밀번호 비교
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    // JWT 발급
    const token = jwt.sign(
      { adminId: admin.id, email, role: "ADMIN" },
      jwtSecret,
      { expiresIn: "12h", issuer: jwtIssuer }
    );
    res.json({ token, message: "관리자 로그인 성공" });
  } catch (error) {
    console.error("🚨 관리자 로그인 오류:", error.message);
    res.status(500).json({ error: "서버 오류: 로그인 실패" });
  }
};

// 🔍 인증된 유저 리스트 조회
const getCertifiedUsers = async (req, res) => {
  try {
    const response = await axios.post("https://univcert.com/api/v1/certifiedlist", {
      key: process.env.UNIVCERT_API_KEY,
    });

    if (!response.data.success) {
      return res.status(400).json({ error: "인증된 유저 목록을 불러올 수 없습니다." });
    }

    res.json(response.data);
  } catch (error) {
    console.error("🚨 UnivCert API 응답 오류:", error);
    res.status(500).json({ error: error.message || "서버 오류: 인증된 유저 목록 조회 실패" });
  }
};

// ✅ 인증된 이메일 전체 삭제 (관리자 전용)
const clearVerifiedEmails = async (req, res) => {
  try {
    await VerifiedEmail.destroy({ where: {} });
    res.status(200).json({ message: "✅ 모든 인증된 이메일이 삭제되었습니다." });
  } catch (error) {
    console.error("🚨 인증된 이메일 삭제 오류:", error.message);
    res.status(500).json({ error: "서버 오류: 인증된 이메일을 삭제하지 못했습니다." });
  }
};

// ✅ exports
module.exports = {
  loginAdmin,
  getCertifiedUsers,
  clearVerifiedEmails,
};
