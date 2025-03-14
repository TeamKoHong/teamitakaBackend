const express = require("express");
const router = express.Router();
const scheduleService = require("../services/scheduleService");

// 일정 생성
router.post("/create", async (req, res) => {
  try {
    const schedule = await scheduleService.createSchedule(req.body);
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 프로젝트별 일정 조회
router.get("/project/:project_id", async (req, res) => {
  try {
    const schedules = await scheduleService.getSchedulesByProject(req.params.project_id);
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 일정 수정
router.put("/:schedule_id", async (req, res) => {
  try {
    await scheduleService.updateSchedule(req.params.schedule_id, req.body);
    res.status(200).json({ message: "일정이 수정되었습니다." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 일정 삭제
router.delete("/:schedule_id", async (req, res) => {
  try {
    await scheduleService.deleteSchedule(req.params.schedule_id);
    res.status(200).json({ message: "일정이 삭제되었습니다." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
