const { Project, ProjectMembers } = require("../models");

const LEADER_ROLES = new Set(["LEADER", "OWNER", "팀장", "leader", "owner"]);

const makeAccessError = (message, status = 403) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const getProjectId = (project) => project?.project_id || project?.dataValues?.project_id;
const getProjectOwnerId = (project) => project?.user_id || project?.dataValues?.user_id;

const sameId = (left, right) => Boolean(left && right && String(left) === String(right));

const isProjectOwner = (project, userId) => sameId(getProjectOwnerId(project), userId);

const findMembership = async (projectId, userId) => {
  if (!projectId || !userId) return null;
  return ProjectMembers.findOne({
    where: { project_id: projectId, user_id: userId },
  });
};

const assertProjectMemberRecord = async (project, userId, message = "프로젝트 멤버만 접근할 수 있습니다.") => {
  if (!project) {
    throw makeAccessError("프로젝트를 찾을 수 없습니다.", 404);
  }

  if (isProjectOwner(project, userId)) {
    return { project, membership: null, isOwner: true };
  }

  const membership = await findMembership(getProjectId(project), userId);
  if (!membership) {
    throw makeAccessError(message, 403);
  }

  return { project, membership, isOwner: false };
};

const assertProjectMember = async (projectId, userId, message) => {
  const project = await Project.findByPk(projectId);
  return assertProjectMemberRecord(project, userId, message);
};

const assertProjectLeaderRecord = async (project, userId, message = "팀장만 수정할 수 있습니다.") => {
  const access = await assertProjectMemberRecord(project, userId, message);
  if (access.isOwner) return access;

  const role = access.membership?.role;
  if (!LEADER_ROLES.has(role)) {
    throw makeAccessError(message, 403);
  }

  return access;
};

const assertProjectLeader = async (projectId, userId, message) => {
  const project = await Project.findByPk(projectId);
  return assertProjectLeaderRecord(project, userId, message);
};

module.exports = {
  assertProjectLeader,
  assertProjectLeaderRecord,
  assertProjectMember,
  assertProjectMemberRecord,
  isProjectOwner,
  sameId,
};
