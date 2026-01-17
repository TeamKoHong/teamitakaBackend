const { Project, Recruitment, User, Todo, Timeline, ProjectMembers } = require("../models");
const pushService = require("./pushService");

const createProject = async (data) => {
  const { title, description, user_id, recruitment_id, start_date, end_date, status } = data;

  const recruitment = await Recruitment.findByPk(recruitment_id);
  if (!recruitment) throw new Error("유효한 모집공고가 필요합니다.");

  const newProject = await Project.create({
    title,
    description,
    user_id,
    recruitment_id,
    start_date,
    end_date,
    status: status || "ACTIVE",
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

const getCompletedProjects = async () => {
  return await Project.findAll({ where: { status: "COMPLETED" } });
};

const updateProject = async (project_id, updateData) => {
  const project = await Project.findByPk(project_id);
  if (!project) throw new Error("프로젝트를 찾을 수 없습니다.");

  const previousStatus = project.status;

  if (updateData.status === "COMPLETED" && !project.end_date) {
    updateData.end_date = new Date();
  }

  await project.update(updateData);

  // 상태가 변경된 경우 푸시 알림 전송
  if (updateData.status && updateData.status !== previousStatus) {
    try {
      // 프로젝트 멤버들 조회
      const members = await ProjectMembers.findAll({
        where: { project_id },
        attributes: ["user_id"],
      });

      const memberIds = members.map((m) => m.user_id);

      if (memberIds.length > 0) {
        // 프로젝트 상태 변경 푸시
        await pushService.sendToUsers(
          memberIds,
          pushService.PUSH_TYPES.PROJECT_STATUS_CHANGE,
          {
            projectName: project.title,
            projectId: project_id,
            newStatus: updateData.status,
          }
        );

        // 프로젝트가 COMPLETED로 변경될 때 팀원 평가 요청 푸시
        if (updateData.status === "COMPLETED") {
          await pushService.sendToUsers(
            memberIds,
            pushService.PUSH_TYPES.REVIEW_REQUEST,
            {
              projectName: project.title,
              projectId: project_id,
            }
          );
        }
      }
    } catch (pushError) {
      console.error("❌ Push notification failed:", pushError.message);
      // 푸시 실패는 프로젝트 업데이트 실패로 이어지지 않음
    }
  }

  return project;
};


module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  getCompletedProjects,
  updateProject,
};
