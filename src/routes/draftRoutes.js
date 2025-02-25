// routes/draftRecruitmentRoutes.js

const express = require("express");
const router = express.Router();
const draftRecruitmentController = require("../controllers/draftRecruitmentController");
const authMiddleware = require("../middlewares/authMiddleware");

// ✅ 모집공고 임시저장 전용 API
router.post("/recruitment/draft", authMiddleware, draftRecruitmentController.createDraftRecruitment);

module.exports = router;