// routes/draftRecruitmentRoutes.js

const express = require("express");
const router = express.Router();
const draftController = require("../controllers/draftController");
const authMiddleware = require("../middlewares/authMiddleware");

// ✅ 모집공고 임시저장 전용 API
router.post("/recruitment/draft", authMiddleware, draftController.createDraftRecruitment);

module.exports = router;