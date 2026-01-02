const { Schedule, User } = require("../models"); 
// 주의: models에 Schedule 모델이 정의되어 있어야 합니다.

// 특정 프로젝트의 일정 조회
const getProjectSchedules = async (req, res) => {
  try {
    const { project_id } = req.params;
    const schedules = await Schedule.findAll({
      where: { project_id },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['user_id', 'username', 'profile_image']
      }],
      order: [['date', 'ASC']]
    });
    res.json(schedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "일정 조회 실패" });
  }
};

// 일정 생성
const createSchedule = async (req, res) => {
  try {
    const { project_id, title, description, date } = req.body;
    const created_by = req.user?.userId || null;

    const newSchedule = await Schedule.create({
      project_id,
      title,
      description,
      date,
      created_by,
    });

    res.status(201).json(newSchedule);
  } catch (error) {
    console.error("일정 생성 에러:", error);
    res.status(400).json({ message: "일정 생성 실패" });
  }
};

module.exports = {
  getProjectSchedules,
  createSchedule,
};