const express = require("express");
const router = express.Router();
const recruitmentController = require("../controllers/recruitmentController");
const authMiddleware = require("../middlewares/authMiddleware");

// 모집공고 전체 조회
router.get("/", recruitmentController.getAllRecruitments);

// 모집공고 상세 조회
router.get("/:recruitment_id", recruitmentController.getRecruitmentById);

// 모집공고 생성
router.post("/", authMiddleware, recruitmentController.createRecruitment);

// 모집공고 수정
router.put("/:recruitment_id", authMiddleware, recruitmentController.updateRecruitment);

// 모집공고 삭제
router.delete("/:recruitment_id", authMiddleware, recruitmentController.deleteRecruitment);

module.exports = router;