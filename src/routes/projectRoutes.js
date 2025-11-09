const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const todoController = require("../controllers/todoController");
const timelineController = require("../controllers/timelineController");
const memberController = require("../controllers/memberController");
const authMiddleware = require("../middlewares/authMiddleware");
const projectPostController = require("../controllers/projectPostController");

// 전체 프로젝트 조회
router.get("/", projectController.getAllProjects);

// 내 프로젝트 조회 (인증 필요, 특정 프로젝트 조회보다 먼저 와야 함)
router.get("/mine", authMiddleware, projectController.getMyProjects);

// 완료된 프로젝트 조회 (특정 프로젝트 조회보다 먼저 와야 함)
router.get("/completed", projectController.getCompletedProjects);

// 특정 프로젝트 조회
router.get("/:project_id", projectController.getProjectById);

// 프로젝트 수정
router.put("/:project_id", authMiddleware, projectController.updateProject);

// ✅ 할 일 CRUD
router.get("/:project_id/todo", todoController.getTodos);
router.post("/:project_id/todo", authMiddleware, todoController.addTodo);
router.put("/:project_id/todo/:todo_id", authMiddleware, todoController.updateTodo);
router.delete("/:project_id/todo/:todo_id", authMiddleware, todoController.deleteTodo);

// ✅ 타임라인 CRUD
router.get("/:project_id/timeline", timelineController.getTimeline);
router.post("/:project_id/timeline", authMiddleware, timelineController.addTimelineEvent);
router.put("/:project_id/timeline/:event_id", authMiddleware, timelineController.updateTimelineEvent);
router.delete("/:project_id/timeline/:event_id", authMiddleware, timelineController.deleteTimelineEvent);

// ✅ 팀원 조회/추가
router.get("/:project_id/members", memberController.getMembers);
router.put("/:project_id/members", authMiddleware, memberController.updateMemberRole);

router.post("/:project_id/posts", projectPostController.createPost);
module.exports = router;
