const express = require("express");
const { loginAdmin, getCertifiedUsers } = require("../controllers/adminController");
const { verifyAdmin } = require("../middlewares/adminMiddleware");

const router = express.Router();

// 🔐 관리자 로그인 (JWT 발급)
router.post("/login", loginAdmin);

// 🔍 인증된 유저 목록 조회 (관리자 전용)
router.get("/certified-users", verifyAdmin, getCertifiedUsers);

module.exports = router;
