const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

// ✅ 회원가입 API
router.post("/register", authController.register);
// ✅ 로그인 API
router.post("/login", authController.login);
// ✅ 현재 로그인한 사용자 정보 조회 (인증 필요)
router.get("/me", authMiddleware, authController.getCurrentUser);
// ✅ 비밀번호 검증 API
router.post("/validate-password", authController.validatePassword);
// ✅ Google 소셜 로그인(ID 토큰)
router.post("/google/id-token", authController.googleSignInByIdToken);
// ✅ Firebase 전화번호 인증
router.post("/phone/verify", authController.verifyPhone);

module.exports = router;
