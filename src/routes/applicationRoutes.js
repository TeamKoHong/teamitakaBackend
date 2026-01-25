// routes/applicationRoutes.js

const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");
const authMiddleware = require("../middlewares/authMiddleware");
const { validateUUID } = require("../middlewares/uuidValidationMiddleware");

// ✅ 내 지원 목록 조회 (순서 중요: 구체적인 경로가 먼저)
router.get("/mine", authMiddleware, applicationController.getMyApplications);

// ✅ 모집공고 지원하기
router.post("/:recruitment_id", authMiddleware, validateUUID('recruitment_id'), applicationController.applyToRecruitment);

// ✅ 특정 모집공고의 지원자 목록 조회
router.get("/:recruitment_id", authMiddleware, validateUUID('recruitment_id'), applicationController.getApplicants);

// ✅ 모집공고 지원 승인
router.post("/:application_id/approve", authMiddleware, validateUUID('application_id'), applicationController.approveApplication);

// ✅ 모집공고 지원 거절
router.post("/:application_id/reject", authMiddleware, validateUUID('application_id'), applicationController.rejectApplication);

// ✅ 지원 취소
router.post("/:application_id/cancel", authMiddleware, validateUUID('application_id'), applicationController.cancelApplication);

// ✅ 지원 취소 (DELETE 방식도 지원)
router.delete("/:application_id", authMiddleware, validateUUID('application_id'), applicationController.cancelApplication);

module.exports = router;
