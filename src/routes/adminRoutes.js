const express = require("express");
const { loginAdmin, getCertifiedUsers } = require("../controllers/adminController"); // ✅ 올바른 경로 확인
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();

// 🔐 관리자 로그인 (JWT 발급)
router.post("/login", loginAdmin);

// 🔍 인증된 유저 목록 조회 (관리자 전용)
router.get("/certified-users", adminMiddleware, getCertifiedUsers);

module.exports = router;
