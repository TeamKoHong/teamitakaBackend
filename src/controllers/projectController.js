const { Project, Recruitment, User, Todo, Timeline, ProjectMember } = require("../models");

const createProject = async (data) => {
  const { title, description, user_id, recruitment_id, start_date, end_date, status, role } = data;

  // 모집공고 존재 여부 확인
  const recruitment = await Recruitment.findByPk(recruitment_id);
  if (!recruitment) throw new Error("유효한 모집공고가 필요합니다.");

};

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        { model: User, as: "User", attributes: ["username"] },
        { model: Recruitment, as: "Recruitment", attributes: ["title"] },
      ],
    });

    // ✅ 이 줄이 없으면 Postman은 계속 로딩됨!
    return res.status(200).json(projects);
  } catch (err) {
    console.error("🔥 Sequelize Error:", err.message);
    return res.status(500).json({ message: "프로젝트 조회 실패", error: err.message });
  }
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

const getCompletedProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({ where: { status: "완료" } });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "완료된 프로젝트 조회 실패" });
  }
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


module.exports = {
  getAllProjects,
  getProjectById,
  updateProject,
  getCompletedProjects,
};
