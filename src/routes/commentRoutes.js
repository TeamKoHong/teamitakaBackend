// routes/commentRoutes.js

const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authMiddleware = require("../middlewares/authMiddleware");

// ✅ 특정 모집공고의 댓글 조회
router.get("/recruitments/:recruitment_id/comment", commentController.getComments);

// ✅ 특정 모집공고에 댓글 작성
router.post("/recruitment/:recruitment_id/comment", authMiddleware, commentController.createComment);

module.exports = router;