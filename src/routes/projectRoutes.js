const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const todoController = require("../controllers/todoController");
const timelineController = require("../controllers/timelineController");
const memberController = require("../controllers/memberController");
const authMiddleware = require("../middlewares/authMiddleware");
const { validateUUID } = require("../middlewares/uuidValidationMiddleware");
const projectPostController = require("../controllers/projectPostController");
const meetingNotesController = require("../controllers/meetingNotesController");

// --- 프로젝트 기본 CRUD ---
router.post("/", authMiddleware, projectController.createProject);
router.get("/", projectController.getAllProjects);
router.get("/mine", authMiddleware, projectController.getMyProjects);
router.get("/completed", projectController.getCompletedProjects);
router.post("/from-recruitment/:recruitment_id", authMiddleware, validateUUID('recruitment_id'), projectController.createProjectFromRecruitment);
router.get("/:project_id", validateUUID('project_id'), projectController.getProjectById);
router.put("/:project_id", authMiddleware, validateUUID('project_id'), projectController.updateProject);

// ✅ 할 일 CRUD
router.get("/:project_id/todo", authMiddleware, validateUUID('project_id'), todoController.getTodos);
router.post("/:project_id/todo", authMiddleware, validateUUID('project_id'), todoController.addTodo);
router.put("/:project_id/todo/:todo_id", authMiddleware, validateUUID('project_id', 'todo_id'), todoController.updateTodo);
router.delete("/:project_id/todo/:todo_id", authMiddleware, validateUUID('project_id', 'todo_id'), todoController.deleteTodo);

// ✅ 팀원 활동 로그
router.get("/:project_id/activity-log", authMiddleware, validateUUID('project_id'), todoController.getActivityLog);
router.delete("/:project_id/activity-log/:todo_id", authMiddleware, validateUUID('project_id', 'todo_id'), todoController.deleteActivityLog);

// ✅ 타임라인 CRUD
router.get("/:project_id/timeline", validateUUID('project_id'), timelineController.getTimeline);
router.post("/:project_id/timeline", authMiddleware, validateUUID('project_id'), timelineController.addTimelineEvent);
router.put("/:project_id/timeline/:event_id", authMiddleware, validateUUID('project_id', 'event_id'), timelineController.updateTimelineEvent);
router.delete("/:project_id/timeline/:event_id", authMiddleware, validateUUID('project_id', 'event_id'), timelineController.deleteTimelineEvent);

// ✅ 회의록 CRUD
router.get("/:project_id/meetings", validateUUID('project_id'), meetingNotesController.getMeetingNotes);
router.get("/:project_id/meetings/:meeting_id", validateUUID('project_id', 'meeting_id'), meetingNotesController.getMeetingNoteById);
router.post("/:project_id/meetings", authMiddleware, validateUUID('project_id'), meetingNotesController.createMeetingNote);
router.put("/:project_id/meetings/:meeting_id", authMiddleware, validateUUID('project_id', 'meeting_id'), meetingNotesController.updateMeetingNote);
router.delete("/:project_id/meetings/:meeting_id", authMiddleware, validateUUID('project_id', 'meeting_id'), meetingNotesController.deleteMeetingNote);

// ✅ 팀원 조회/추가
router.get("/:project_id/members", validateUUID('project_id'), memberController.getMembers);
router.put("/:project_id/members", authMiddleware, validateUUID('project_id'), memberController.updateMemberRole);

// --- 즐겨찾기 ---
router.put("/:project_id/favorite", authMiddleware, validateUUID('project_id'), projectController.toggleProjectFavorite);

// --- 평가 및 게시글 ---
router.get("/:project_id/eval-targets", authMiddleware, validateUUID('project_id'), projectController.getEvalTargets);
router.post("/:project_id/posts", validateUUID('project_id'), projectPostController.createPost);

// [삭제됨] Todo, Timeline 경로는 별도 파일(todoRoutes, scheduleRoutes)로 분리 권장

module.exports = router;