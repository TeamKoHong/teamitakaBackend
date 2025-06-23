const express = require("express");
const router = express.Router();
const projectPostController = require("../controllers/projectPostController");
const adminAuth = require("../middlewares/authMiddleware");
const { jwtSecret } = require("../config/authConfig");

// 인증 미들웨어 정의
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>" 형식 예상

  if (!token) {
    return res.status(401).json({ error: "인증 토큰이 필요합니다." });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "유효하지 않은 토큰입니다." });
    }
    req.user = user; // 토큰에서 추출된 사용자 정보 (user_id 포함)
    next();
  });
};

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