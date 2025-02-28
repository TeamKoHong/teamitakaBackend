const { Project, Recruitment, User, Todo, Timeline, ProjectMember } = require("../models");

const createProject = async (data) => {
  const { title, description, user_id, recruitment_id, start_date, end_date, status, role } = data;

  // 모집공고 존재 여부 확인
  const recruitment = await Recruitment.findByPk(recruitment_id);
  if (!recruitment) throw new Error("유효한 모집공고가 필요합니다.");

  const newProject = await Project.create({
    title,
    description,
    user_id,
    recruitment_id,
    start_date,
    end_date,
    status: status || "예정",
    role,
  });

  return newProject;
};

const getAllProjects = async () => {
  return await Project.findAll({
    order: [["created_at", "DESC"]],
    include: [
      { model: User, attributes: ["username"] },
      { model: Recruitment, attributes: ["title"] },
    ],
  });
};

const getProjectById = async (project_id) => {
  const project = await Project.findByPk(project_id, {
    include: [
      { model: User, attributes: ["username"] },
      { model: Recruitment, attributes: ["title"] },
      { model: Todo },
      { model: Timeline },
      {
        model: User,
        as: "Members",
        through: { attributes: ["role"] },
      },
    ],
  });

  if (!project) throw new Error("프로젝트를 찾을 수 없습니다.");
  return project;
};

const updateProject = async (project_id, updateData) => {
  const project = await Project.findByPk(project_id);
  if (!project) throw new Error("프로젝트를 찾을 수 없습니다.");

  // status가 "완료"일 경우, end_date가 없으면 현재 날짜로 설정
  if (updateData.status === "완료" && !project.end_date) {
    updateData.end_date = new Date();
  }

  await project.update(updateData);
  return project;
};

const deleteProject = async (project_id) => {
  const project = await Project.findByPk(project_id);
  if (!project) throw new Error("프로젝트를 찾을 수 없습니다.");
  await project.destroy();
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
