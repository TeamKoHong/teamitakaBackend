const express = require("express");
const router = express.Router();
const projectPostController = require("../controllers/projectPostController");
const adminAuth = require("../middlewares/authMiddleware");
const { jwtSecret } = require("../config/authConfig");
const { authenticateToken } = require("../middleware/auth");
const jwt = require("jsonwebtoken");

// 게시물 생성 (POST 요청)
router.post(
  "/:project_id/posts",
  (req, res, next) => {
    console.log("POST /api/:project_id/posts");
    console.log("Received project_id:", req.params.project_id);
    next();
  },
  adminAuth, // 관리자 인증 미들웨어 적용
  projectPostController.createPost
);

// 특정 프로젝트의 게시물 목록 조회 (GET 요청)
router.get(
  "/:project_id/posts",
  (req, res, next) => {
    console.log("GET /api/:project_id/posts");
    console.log("Received project_id:", req.params.project_id); // project_id 값 확인
    next();
  },
  projectPostController.getPostsByProject
);

// 특정 게시물 조회 (GET 요청)
router.get(
  "/posts/:post_id",
  (req, res, next) => {
    console.log("GET /api/posts/:post_id");
    console.log("Received post_id:", req.params.post_id); // post_id 값 확인
    next();
  },
  projectPostController.getPostById
);

module.exports = router;