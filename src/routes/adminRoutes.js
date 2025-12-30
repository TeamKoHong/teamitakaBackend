const express = require("express");
const adminController = require("../controllers/adminController");
const adminMiddleware = require("../middlewares/adminMiddleware");
const { transitionExpiredProjects } = require("../jobs/projectStatusJob");

const router = express.Router();

// 🔐 관리자 로그인 (JWT 발급)
router.post("/login", adminController.loginAdmin);

// 🔍 인증된 유저 목록 조회 (관리자 전용)
router.get("/certified-users", adminMiddleware, adminController.getCertifiedUsers);

// 인증된 유저 목록 삭제 (관리자 전용)
router.delete("/clear-verified-emails", adminMiddleware, adminController.clearVerifiedEmails);

// ⏰ 만료된 프로젝트 상태 전환 (수동 트리거, 관리자 전용)
router.post("/projects/transition-expired", adminMiddleware, async (req, res) => {
  try {
    const result = await transitionExpiredProjects();

    res.json({
      success: true,
      message: 'Project status transition completed successfully',
      transitioned_count: result.count,
      project_ids: result.projects.map(p => p.project_id),
      duration_ms: result.duration_ms,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to transition project statuses',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
