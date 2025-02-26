const { Timeline } = require("../models");
const { handleError } = require("../utils/errorHandler");

// ✅ 타임라인 조회
const getTimeline = async (req, res) => {
  try {
    const { project_id } = req.params;
    const timeline = await Timeline.findAll({
      where: { project_id },
      order: [["date", "ASC"]],
    });
    res.status(200).json(timeline);
  } catch (error) {
    handleError(res, error);
  }
};

// ✅ 타임라인 추가
const addTimelineEvent = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { event, date } = req.body;

    const newEvent = await Timeline.create({
      project_id,
      event,
      date,
    });

    res.status(201).json(newEvent);
  } catch (error) {
    handleError(res, error);
  }
};

// ✅ 타임라인 수정
const updateTimelineEvent = async (req, res) => {
  try {
    const { event_id } = req.params;
    const { event, date } = req.body;

    const timelineEvent = await Timeline.findByPk(event_id);
    if (!timelineEvent) {
      return res.status(404).json({ message: "이벤트를 찾을 수 없습니다." });
    }

    await timelineEvent.update({ event, date });
    res.json(timelineEvent);
  } catch (error) {
    handleError(res, error);
  }
};

// ✅ 타임라인 삭제
const deleteTimelineEvent = async (req, res) => {
  try {
    const { event_id } = req.params;

    const timelineEvent = await Timeline.findByPk(event_id);
    if (!timelineEvent) {
      return res.status(404).json({ message: "이벤트를 찾을 수 없습니다." });
    }

    await timelineEvent.destroy();
    res.json({ message: "타임라인 이벤트가 삭제되었습니다." });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getTimeline,
  addTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent,
};
