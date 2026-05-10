const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const authMiddleware = require("../middlewares/authMiddleware");
const { validateUUID } = require("../middlewares/uuidValidationMiddleware");

// GET /api/schedule/project/:project_id
router.get("/upcoming", authMiddleware, scheduleController.getUpcomingSchedules);
router.get("/project/:project_id", authMiddleware, validateUUID('project_id'), scheduleController.getProjectSchedules);

// POST /api/schedule/create
router.post("/create", authMiddleware, scheduleController.createSchedule);

// PUT/DELETE /api/schedule/:schedule_id
router.put("/:schedule_id", authMiddleware, validateUUID('schedule_id'), scheduleController.updateSchedule);
router.delete("/:schedule_id", authMiddleware, validateUUID('schedule_id'), scheduleController.deleteSchedule);

module.exports = router;
