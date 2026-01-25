const express = require("express");
const router = express.Router();
const recruitmentController = require("../controllers/recruitmentController");
const applicationController = require("../controllers/applicationController");
const authMiddleware = require("../middlewares/authMiddleware");
const optionalAuthMiddleware = require("../middlewares/optionalAuthMiddleware");
const { validateInput } = require("../middlewares/validationMiddleware");
const { validateUUID } = require("../middlewares/uuidValidationMiddleware");
const { createRecruitmentSchema, updateRecruitmentSchema } = require("../validations/recruitmentValidation");

// 모집공고 전체 조회 (로그인 시 is_scrapped 포함)
router.get("/", optionalAuthMiddleware, recruitmentController.getAllRecruitments);

// 내가 작성한 모집공고 목록 조회 (/:id보다 먼저 정의해야 함!)
router.get("/mine", authMiddleware, recruitmentController.getMyRecruitments);

// 모집공고별 지원자 목록 조회 (RESTful 설계)
router.get("/:recruitment_id/applications", authMiddleware, validateUUID('recruitment_id'), applicationController.getApplicants);

// 모집공고 상세 조회
router.get("/:recruitment_id", authMiddleware, validateUUID('recruitment_id'), recruitmentController.getRecruitmentById);
// 모집공고 생성
router.post("/", authMiddleware, validateInput(createRecruitmentSchema), recruitmentController.createRecruitment);
router.post("/:recruitment_id/scrap", authMiddleware, validateUUID('recruitment_id'), recruitmentController.toggleScrap);
// 모집공고 수정
router.put("/:recruitment_id", authMiddleware, validateUUID('recruitment_id'), validateInput(updateRecruitmentSchema), recruitmentController.updateRecruitment);

// 모집공고 삭제
router.delete("/:recruitment_id", authMiddleware, validateUUID('recruitment_id'), recruitmentController.deleteRecruitment);

module.exports = router;