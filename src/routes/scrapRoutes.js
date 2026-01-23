// routes/scrapRoutes.js

const express = require("express");
const router = express.Router();
const scrapController = require("../controllers/scrapController");
const authMiddleWare = require("../middlewares/authMiddleware");
const { validateUUID } = require("../middlewares/uuidValidationMiddleware");

// ✅ 사용자가 스크랩한 모집공고 목록 조회
router.get("/recruitments", authMiddleWare, scrapController.getUserScraps);

// ✅ 모집공고 스크랩 추가/삭제
router.put("/recruitment/:recruitment_id/scrap", authMiddleWare, validateUUID('recruitment_id'), scrapController.toggleScrap);

module.exports = router;