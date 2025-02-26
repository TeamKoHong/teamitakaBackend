const express = require("express");
const router = express.Router();
const recruitmentController = require("../controllers/recruitmentController");
const authMiddleware = require("../middlewares/authMiddleware");

// 모집공고 전체 조회
router.get("/recruitment", recruitmentController.getAllRecruitments);

// 모집공고 상세 조회
router.get("/recruitment/:recruitment_id", recruitmentController.getRecruitmentById);

// 모집공고 생성
router.post("/recruitment", authMiddleware, recruitmentController.createRecruitment);

// 모집공고 수정 (CLOSED 시 프로젝트 생성)
router.put("/recruitment/:recruitment_id", authMiddleware, recruitmentController.updateRecruitment);

// 모집공고 삭제
router.delete("/recruitment/:recruitment_id", authMiddleware, recruitmentController.deleteRecruitment);

module.exports = router;
