// routes/applicationRoutes.js

const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");
const authMiddleware = require("../middlewares/authMiddleware");

// ✅ 모집공고 지원하기
router.post("/:recruitment_id", authMiddleware, applicationController.applyToRecruitment);

// ✅ 특정 모집공고의 지원자 목록 조회
router.get("/:recruitment_id", authMiddleware, applicationController.getApplicants);

// ✅ 모집공고 지원 승인
router.post("/:application_id/approve", authMiddleware, applicationController.approveApplication);

// ✅ 모집공고 지원 거절
router.post("/:application_id/reject", authMiddleware, applicationController.rejectApplication);

module.exports = router;
