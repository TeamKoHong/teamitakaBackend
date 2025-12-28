const meetingNotesService = require("../services/meetingNotesService");
const { handleError } = require("../utils/errorHandler");

/**
 * 회의록 목록 조회
 * GET /projects/:project_id/meetings
 */
const getMeetingNotes = async (req, res) => {
  try {
    const { project_id } = req.params;
    const meetings = await meetingNotesService.getMeetingNotesByProject(project_id);

    res.status(200).json({
      success: true,
      message: "회의록을 조회했습니다",
      data: {
        items: meetings,
        total: meetings.length
      }
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * 회의록 상세 조회
 * GET /projects/:project_id/meetings/:meeting_id
 */
const getMeetingNoteById = async (req, res) => {
  try {
    const { meeting_id } = req.params;
    const meeting = await meetingNotesService.getMeetingNoteById(meeting_id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "회의록을 찾을 수 없습니다"
      });
    }

    res.status(200).json({
      success: true,
      message: "회의록을 조회했습니다",
      data: meeting
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * 회의록 생성
 * POST /projects/:project_id/meetings
 */
const createMeetingNote = async (req, res) => {
  try {
    const { project_id } = req.params;
    const created_by = req.user.userId;
    const { title, content, meeting_date } = req.body;

    if (!title || !meeting_date) {
      return res.status(400).json({
        success: false,
        message: "제목과 회의 날짜는 필수입니다"
      });
    }

    const meeting = await meetingNotesService.createMeetingNote(
      project_id,
      created_by,
      { title, content, meeting_date }
    );

    res.status(201).json({
      success: true,
      message: "회의록이 생성되었습니다",
      data: meeting
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * 회의록 수정
 * PUT /projects/:project_id/meetings/:meeting_id
 */
const updateMeetingNote = async (req, res) => {
  try {
    const { meeting_id } = req.params;
    const { title, content, meeting_date } = req.body;

    const meeting = await meetingNotesService.updateMeetingNote(meeting_id, {
      title,
      content,
      meeting_date
    });

    res.status(200).json({
      success: true,
      message: "회의록이 수정되었습니다",
      data: meeting
    });
  } catch (error) {
    if (error.message === "회의록을 찾을 수 없습니다.") {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    handleError(res, error);
  }
};

/**
 * 회의록 삭제
 * DELETE /projects/:project_id/meetings/:meeting_id
 */
const deleteMeetingNote = async (req, res) => {
  try {
    const { meeting_id } = req.params;

    await meetingNotesService.deleteMeetingNote(meeting_id);

    res.status(200).json({
      success: true,
      message: "회의록이 삭제되었습니다"
    });
  } catch (error) {
    if (error.message === "회의록을 찾을 수 없습니다.") {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    handleError(res, error);
  }
};

module.exports = {
  getMeetingNotes,
  getMeetingNoteById,
  createMeetingNote,
  updateMeetingNote,
  deleteMeetingNote
};
