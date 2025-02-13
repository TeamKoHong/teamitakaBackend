const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { adminEmail, adminPassword, jwtSecret } = require("../config/authConfig");
const axios = require("axios");

// 🔐 관리자 로그인
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  if (email !== adminEmail) {
    return res.status(403).json({ error: "관리자 계정이 아닙니다." });
  }

  const isMatch = await bcrypt.compare(password, adminPassword);
  if (!isMatch) {
    return res.status(401).json({ error: "비밀번호가 올바르지 않습니다." });
  }

  const token = jwt.sign({ email, role: "ADMIN" }, jwtSecret, { expiresIn: "12h" });
  res.json({ token, message: "관리자 로그인 성공" });
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

// ✅ exports 수정
module.exports = {
  loginAdmin,
  getCertifiedUsers
};
