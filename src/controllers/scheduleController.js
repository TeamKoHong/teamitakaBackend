const { Schedule, User, Project, ProjectMembers } = require("../models");
const { Op } = require("sequelize");
// 주의: models에 Schedule 모델이 정의되어 있어야 합니다.

const isProjectOwner = (project, userId) => project?.user_id === userId;

const assertProjectMember = async (project_id, userId) => {
  const project = await Project.findByPk(project_id);
  if (!project) {
    const error = new Error("프로젝트를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  if (isProjectOwner(project, userId)) {
    return { project, membership: null };
  }

  const membership = await ProjectMembers.findOne({
    where: { project_id, user_id: userId },
  });

  if (!membership) {
    const error = new Error("프로젝트 멤버만 일정을 관리할 수 있습니다.");
    error.status = 403;
    throw error;
  }

  return { project, membership };
};

const findScheduleForMember = async (schedule_id, userId) => {
  const schedule = await Schedule.findByPk(schedule_id);
  if (!schedule) {
    const error = new Error("일정을 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  await assertProjectMember(schedule.project_id, userId);
  return schedule;
};

// 특정 프로젝트의 일정 조회
const getProjectSchedules = async (req, res) => {
  try {
    const { project_id } = req.params;
    const userId = req.user?.userId;

    await assertProjectMember(project_id, userId);

    const schedules = await Schedule.findAll({
      where: { project_id },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['user_id', 'username', 'avatar']
      }],
      order: [['date', 'ASC']]
    });
    res.json(schedules);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || "일정 조회 실패" });
  }
};

// 일정 생성
const createSchedule = async (req, res) => {
  try {
    const { project_id, title, description, date } = req.body;
    const created_by = req.user?.userId || null;

    if (!project_id || !title || !date) {
      return res.status(400).json({ message: "프로젝트, 제목, 일정 날짜는 필수입니다." });
    }

    await assertProjectMember(project_id, created_by);

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
    res.status(error.status || 400).json({ message: error.message || "일정 생성 실패" });
  }
};

// 일정 수정
const updateSchedule = async (req, res) => {
  try {
    const { schedule_id } = req.params;
    const userId = req.user?.userId;
    const { title, description, date } = req.body;
    const updateData = {};

    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({ message: "일정 제목은 비워둘 수 없습니다." });
      }
      updateData.title = String(title).trim();
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (date !== undefined) {
      if (!date) {
        return res.status(400).json({ message: "일정 날짜는 비워둘 수 없습니다." });
      }
      updateData.date = date;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "수정할 일정 정보가 없습니다." });
    }

    const schedule = await findScheduleForMember(schedule_id, userId);
    await schedule.update(updateData);

    res.json({
      success: true,
      message: "일정이 수정되었습니다.",
      data: schedule,
    });
  } catch (error) {
    console.error("일정 수정 에러:", error);
    res.status(error.status || 400).json({ message: error.message || "일정 수정 실패" });
  }
};

// 일정 삭제
const deleteSchedule = async (req, res) => {
  try {
    const { schedule_id } = req.params;
    const userId = req.user?.userId;

    const schedule = await findScheduleForMember(schedule_id, userId);
    await schedule.destroy();

    res.json({
      success: true,
      message: "일정이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("일정 삭제 에러:", error);
    res.status(error.status || 400).json({ message: error.message || "일정 삭제 실패" });
  }
};

const getUpcomingSchedules = async (req, res) => {
  try {
    const user_id = req.user?.userId;
    const { days = 7, limit = 5, offset = 0 } = req.query;
    const now = new Date();
    const until = new Date(now);
    until.setDate(until.getDate() + parseInt(days, 10));

    const memberships = await ProjectMembers.findAll({
      where: { user_id },
      attributes: ['project_id'],
    });
    const ownerProjects = await Project.findAll({
      where: { user_id },
      attributes: ['project_id'],
    });
    const projectIds = [
      ...new Set([
        ...memberships.map((membership) => membership.project_id),
        ...ownerProjects.map((project) => project.project_id),
      ]),
    ];

    if (projectIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        items: [],
        total: 0,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      });
    }

    const result = await Schedule.findAndCountAll({
      where: {
        project_id: { [Op.in]: projectIds },
        date: { [Op.between]: [now, until] },
      },
      include: [
        {
          model: Project,
          attributes: ['project_id', 'title', 'status'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['user_id', 'username', 'avatar'],
        },
      ],
      order: [['date', 'ASC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    res.json({
      success: true,
      data: result.rows,
      items: result.rows,
      total: result.count,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
  } catch (error) {
    console.error("다가오는 일정 조회 에러:", error);
    res.status(500).json({ success: false, message: "다가오는 일정 조회 실패" });
  }
};

module.exports = {
  getProjectSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getUpcomingSchedules,
};
