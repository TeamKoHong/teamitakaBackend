const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const todoController = require("../controllers/todoController");
const timelineController = require("../controllers/timelineController");
const memberController = require("../controllers/memberController");
const authMiddleware = require("../middlewares/authMiddleware");

// 전체 프로젝트 조회
router.get("/projects", projectController.getAllProjects);

// 특정 프로젝트 조회
router.get("/projects/:project_id", projectController.getProjectById);

// 프로젝트 수정
router.put("/projects/:project_id", authMiddleware, projectController.updateProject);

// 프로젝트 삭제
router.delete("/projects/:project_id", authMiddleware, projectController.deleteProject);

// ✅ 할 일 CRUD
router.get("/projects/:project_id/todo", todoController.getTodos);
router.post("/projects/:project_id/todo", authMiddleware, todoController.addTodo);
router.put("/projects/:project_id/todo/:todo_id", authMiddleware, todoController.updateTodo);
router.delete("/projects/:project_id/todo/:todo_id", authMiddleware, todoController.deleteTodo);

// ✅ 타임라인 CRUD
router.get("/projects/:project_id/timeline", timelineController.getTimeline);
router.post("/projects/:project_id/timeline", authMiddleware, timelineController.addTimelineEvent);
router.put("/projects/:project_id/timeline/:event_id", authMiddleware, timelineController.updateTimelineEvent);
router.delete("/projects/:project_id/timeline/:event_id", authMiddleware, timelineController.deleteTimelineEvent);

// ✅ 팀원 조회/추가
router.get("/projects/:project_id/members", memberController.getMembers);
router.post("/projects/:project_id/members", authMiddleware, memberController.addMember);
router.put("/projects/:project_id/members", authMiddleware, memberController.updateMemberRole);
router.post("/projects/:project_id/members", authMiddleware, memberController.removeMember);

module.exports = router;
