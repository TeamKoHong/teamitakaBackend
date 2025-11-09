const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middlewares/authMiddleware");

// ✅ 대시보드 요약 정보 조회 (인증 필요)
router.get("/summary", authMiddleware, dashboardController.getDashboardSummary);

module.exports = router;
