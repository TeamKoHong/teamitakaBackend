const express = require("express");
const adminController = require("../controllers/adminController");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();

// 🔐 관리자 로그인 (JWT 발급)
router.post("/login", adminController.loginAdmin);

// 🔍 인증된 유저 목록 조회 (관리자 전용)
router.get("/certified-users", adminMiddleware, adminController.getCertifiedUsers);

// 인증된 유저 목록 삭제 (관리자 전용)
router.delete("/clear-verified-emails", adminMiddleware, adminController.clearVerifiedEmails);

module.exports = router;
