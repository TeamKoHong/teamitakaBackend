// src/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// ✅ 회원가입 API
router.post("/register", authController.register);
// ✅ 로그인 API
router.post("/login", authController.login);
// ✅ 비밀번호 검증 API
router.post("/validate-password", authController.validatePassword);

module.exports = router;
