// routes/commentRoutes.js

const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authMiddleware = require("../middlewares/authMiddleware");

// ✅ 특정 모집공고의 댓글 조회
router.get("/:recruitment_id", commentController.getComments);

// ✅ 특정 모집공고에 댓글 작성
router.post("/:recruitment_id", authMiddleware, commentController.createComment);

module.exports = router;