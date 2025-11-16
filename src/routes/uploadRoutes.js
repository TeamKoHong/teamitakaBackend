const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * POST /api/upload/recruitment-image
 * 모집공고 이미지 업로드 (인증 필요)
 */
router.post("/recruitment-image", authMiddleware, uploadController.uploadRecruitmentImage);

module.exports = router;
