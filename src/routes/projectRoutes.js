const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const memberController = require("../controllers/memberController");
const authMiddleware = require("../middlewares/authMiddleware");
const projectPostController = require("../controllers/projectPostController");

// --- 프로젝트 기본 CRUD ---
router.post("/", authMiddleware, projectController.createProject);
router.get("/", projectController.getAllProjects);
router.get("/mine", authMiddleware, projectController.getMyProjects);
router.get("/completed", projectController.getCompletedProjects);
router.post("/from-recruitment/:recruitment_id", authMiddleware, projectController.createProjectFromRecruitment);
router.get("/:project_id", projectController.getProjectById);
router.put("/:project_id", authMiddleware, projectController.updateProject);

// --- 팀원 관련 ---
router.get("/:project_id/members", memberController.getMembers);
router.put("/:project_id/members", authMiddleware, memberController.updateMemberRole);

// --- 평가 및 게시글 ---
router.get("/:project_id/eval-targets", authMiddleware, projectController.getEvalTargets);
router.post("/:project_id/posts", projectPostController.createPost);

// [삭제됨] Todo, Timeline 경로는 별도 파일(todoRoutes, scheduleRoutes)로 분리 권장

module.exports = router;