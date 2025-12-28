const { MeetingNotes, Project, User } = require("../models");

/**
 * 프로젝트의 모든 회의록 조회
 */
const getMeetingNotesByProject = async (project_id) => {
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
const getMeetingNoteById = async (meeting_id) => {
  return await MeetingNotes.findByPk(meeting_id, {
    include: [{
      model: User,
      as: "Creator",
      attributes: ["user_id", "username", "avatar"]
    }],
  });
};

/**
 * 회의록 생성
 */
const createMeetingNote = async (project_id, created_by, data) => {
  const project = await Project.findByPk(project_id);
  if (!project) throw new Error("프로젝트를 찾을 수 없습니다.");

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
const updateMeetingNote = async (meeting_id, data) => {
  const meeting = await MeetingNotes.findByPk(meeting_id);
  if (!meeting) throw new Error("회의록을 찾을 수 없습니다.");

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
const deleteMeetingNote = async (meeting_id) => {
  const meeting = await MeetingNotes.findByPk(meeting_id);
  if (!meeting) throw new Error("회의록을 찾을 수 없습니다.");

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
