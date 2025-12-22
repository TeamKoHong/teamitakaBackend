const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const authMiddleware = require("../middlewares/authMiddleware");

// GET /api/schedule/project/:project_id
router.get("/project/:project_id", scheduleController.getProjectSchedules);

// POST /api/schedule/create
router.post("/create", authMiddleware, scheduleController.createSchedule);

module.exports = router;