const express = require("express");
const router = express.Router();
const projectPostController = require("../controllers/projectPostController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { validateUUID } = require("../middlewares/uuidValidationMiddleware");

// 게시물 생성 (POST 요청)
router.post(
  "/:project_id/posts",
  validateUUID('project_id'),
  authenticateToken,
  projectPostController.createPost
);

// 특정 프로젝트의 게시물 목록 조회 (GET 요청)
router.get(
  "/:project_id/posts",
  validateUUID('project_id'),
  authenticateToken,
  projectPostController.getPostsByProject
);

// 특정 게시물 조회 (GET 요청)
router.get(
  "/posts/:post_id",
  validateUUID('post_id'),
  authenticateToken,
  projectPostController.getPostById
);

module.exports = router;
