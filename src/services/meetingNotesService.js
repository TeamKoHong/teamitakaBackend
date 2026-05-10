const { MeetingNotes, Project, ProjectMembers, User } = require("../models");

const makeError = (message, status = 500) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const findProjectOrThrow = async (project_id) => {
  const project = await Project.findByPk(project_id);
  if (!project) throw makeError("프로젝트를 찾을 수 없습니다.", 404);
  return project;
};

const isProjectOwner = (project, user_id) => project?.user_id === user_id;

const findMembership = async (project_id, user_id) => {
  return await ProjectMembers.findOne({
    where: { project_id, user_id },
  });
};

const assertProjectMember = async (project_id, user_id) => {
  const project = await findProjectOrThrow(project_id);
  if (isProjectOwner(project, user_id)) return { project, membership: null };

  const membership = await findMembership(project_id, user_id);
  if (!membership) {
    throw makeError("프로젝트 멤버만 회의록에 접근할 수 있습니다.", 403);
  }

  return { project, membership };
};

const findMeetingInProjectOrThrow = async (project_id, meeting_id) => {
  const meeting = await MeetingNotes.findByPk(meeting_id);
  if (!meeting || meeting.project_id !== project_id) {
    throw makeError("회의록을 찾을 수 없습니다.", 404);
  }
  return meeting;
};

const assertMeetingAuthorOrOwner = async (project_id, meeting_id, user_id) => {
  const { project } = await assertProjectMember(project_id, user_id);
  const meeting = await findMeetingInProjectOrThrow(project_id, meeting_id);

  if (!isProjectOwner(project, user_id) && meeting.created_by !== user_id) {
    throw makeError("회의록 작성자 또는 프로젝트 팀장만 변경할 수 있습니다.", 403);
  }

  return meeting;
};

/**
 * 프로젝트의 모든 회의록 조회
 */
const getMeetingNotesByProject = async (project_id, user_id) => {
  await assertProjectMember(project_id, user_id);

  return await MeetingNotes.findAll({
    where: { project_id },
    include: [{
      model: User,
      as: "Creator",
      attributes: ["user_id", "username", "avatar"]
    }],
    order: [["meeting_date", "DESC"]],
  });
};

/**
 * 단일 회의록 상세 조회
 */
const getMeetingNoteById = async (project_id, meeting_id, user_id) => {
  await assertProjectMember(project_id, user_id);

  const meeting = await MeetingNotes.findByPk(meeting_id, {
    include: [{
      model: User,
      as: "Creator",
      attributes: ["user_id", "username", "avatar"]
    }],
  });
  if (!meeting || meeting.project_id !== project_id) {
    throw makeError("회의록을 찾을 수 없습니다.", 404);
  }
  return meeting;
};

/**
 * 회의록 생성
 */
const createMeetingNote = async (project_id, created_by, data) => {
  await assertProjectMember(project_id, created_by);

  const { title, content, meeting_date } = data;

  return await MeetingNotes.create({
    project_id,
    created_by,
    title,
    content,
    meeting_date,
  });
};

/**
 * 회의록 수정
 */
const updateMeetingNote = async (project_id, meeting_id, actor_user_id, data) => {
  const meeting = await assertMeetingAuthorOrOwner(project_id, meeting_id, actor_user_id);
  const { title, content, meeting_date } = data;

  await meeting.update({
    ...(title && { title }),
    ...(content !== undefined && { content }),
    ...(meeting_date && { meeting_date }),
  });

  return meeting;
};

/**
 * 회의록 삭제
 */
const deleteMeetingNote = async (project_id, meeting_id, actor_user_id) => {
  const meeting = await assertMeetingAuthorOrOwner(project_id, meeting_id, actor_user_id);
  await meeting.destroy();
  return true;
};

module.exports = {
  getMeetingNotesByProject,
  getMeetingNoteById,
  createMeetingNote,
  updateMeetingNote,
  deleteMeetingNote
};
