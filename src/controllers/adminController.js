const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { adminEmail, adminPassword, jwtSecret } = require("../config/authConfig");
const axios = require("axios");

// 🔐 관리자 로그인
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  if (email !== adminEmail) {
    return res.status(403).json({ error: "관리자 계정이 아닙니다." });
  }

  const isMatch = await bcrypt.compare(password, adminPassword);
  if (!isMatch) {
    return res.status(401).json({ error: "비밀번호가 올바르지 않습니다." });
  }

  const token = jwt.sign({ email, isAdmin: true }, jwtSecret, { expiresIn: "12h" });
  res.json({ token, message: "관리자 로그인 성공" });
};

// 🔍 인증된 유저 리스트 조회
exports.getCertifiedUsers = async (req, res) => {
  try {
    const response = await axios.post("https://univcert.com/api/v1/certifiedlist", {
      key: process.env.UNIVCERT_API_KEY,
    });

    if (!response.data.success) {
      return res.status(400).json({ error: "인증된 유저 목록을 불러올 수 없습니다." });
    }

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "서버 오류: 인증된 유저 목록 조회 실패" });
  }
};
