const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const todoController = require("../controllers/todoController");
const timelineController = require("../controllers/timelineController");
const memberController = require("../controllers/memberController");
const authMiddleware = require("../middlewares/authMiddleware");
const projectPostController = require("../controllers/projectPostController");
const meetingNotesController = require("../controllers/meetingNotesController");

// --- 프로젝트 기본 CRUD ---
router.post("/", authMiddleware, projectController.createProject);
router.get("/", projectController.getAllProjects);
router.get("/mine", authMiddleware, projectController.getMyProjects);
router.get("/completed", projectController.getCompletedProjects);
router.post("/from-recruitment/:recruitment_id", authMiddleware, projectController.createProjectFromRecruitment);
router.get("/:project_id", projectController.getProjectById);
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

// ✅ 회의록 CRUD
router.get("/:project_id/meetings", meetingNotesController.getMeetingNotes);
router.get("/:project_id/meetings/:meeting_id", meetingNotesController.getMeetingNoteById);
router.post("/:project_id/meetings", authMiddleware, meetingNotesController.createMeetingNote);
router.put("/:project_id/meetings/:meeting_id", authMiddleware, meetingNotesController.updateMeetingNote);
router.delete("/:project_id/meetings/:meeting_id", authMiddleware, meetingNotesController.deleteMeetingNote);

// ✅ 팀원 조회/추가
router.get("/:project_id/members", memberController.getMembers);
router.put("/:project_id/members", authMiddleware, memberController.updateMemberRole);

// --- 평가 및 게시글 ---
router.get("/:project_id/eval-targets", authMiddleware, projectController.getEvalTargets);
router.post("/:project_id/posts", projectPostController.createPost);

// [삭제됨] Todo, Timeline 경로는 별도 파일(todoRoutes, scheduleRoutes)로 분리 권장

module.exports = router;