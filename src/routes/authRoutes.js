const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// ✅ 기존 로그인 & 회원가입 API (예제)
router.post("/register", authController.register);
router.post("/login", authController.login);

// ✅ 비밀번호 검증 API 추가
router.post("/validate-password", authController.validatePassword);

module.exports = router;
