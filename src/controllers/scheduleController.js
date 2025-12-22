const { Schedule, User } = require("../models"); 
// 주의: models에 Schedule 모델이 정의되어 있어야 합니다.

// 특정 프로젝트의 일정 조회
const getProjectSchedules = async (req, res) => {
  try {
    const { project_id } = req.params;
    const schedules = await Schedule.findAll({
      where: { project_id },
      // 작성자 정보를 같이 가져오고 싶다면 include 사용
      // include: [{ model: User, attributes: ['username'] }]
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
    // user_id는 토큰에서 가져오거나 body에서 받음
    // const user_id = req.user ? req.user.userId : null; 

    const newSchedule = await Schedule.create({
      project_id,
      title,
      description,
      date, // "YYYY-MM-DD HH:mm:ss" 형식
      // user_id, // 필요시 주석 해제
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