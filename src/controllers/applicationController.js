const applicationService = require("../services/applicationService");
const { handleError } = require("../utils/errorHandler");

const applyToRecruitment = async (req, res) => {
  try {
    const { recruitment_id } = req.params;
    const user_id = res.locals.user.user_id;
    const { introduction, portfolio_project_ids } = req.body;

    // 입력 검증
    if (!introduction || introduction.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "INVALID_INPUT",
        message: "자기소개는 필수 항목입니다."
      });
    }

    if (introduction.length > 500) {
      return res.status(400).json({
        success: false,
        error: "INVALID_INPUT",
        message: "자기소개는 500자 이하여야 합니다."
      });
    }

    if (portfolio_project_ids && !Array.isArray(portfolio_project_ids)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_INPUT",
        message: "포트폴리오 프로젝트 ID는 배열 형식이어야 합니다."
      });
    }

    const application = await applicationService.applyToRecruitment(
      user_id,
      recruitment_id,
      introduction,
      portfolio_project_ids
    );
    res.status(201).json({
      success: true,
      message: "지원이 완료되었습니다.",
      data: application
    });
  } catch (error) {
    if (error.message === "모집공고가 존재하지 않습니다.") {
      return res.status(404).json({
        success: false,
        error: "RECRUITMENT_NOT_FOUND",
        message: error.message
      });
    }
    if (error.message === "이미 지원한 모집공고입니다.") {
      return res.status(409).json({
        success: false,
        error: "ALREADY_APPLIED",
        message: error.message
      });
    }
    if (error.message === "본인이 작성한 모집글에는 지원할 수 없습니다.") {
      return res.status(400).json({
        success: false,
        error: "SELF_APPLICATION",
        message: error.message
      });
    }
    if (error.message === "마감된 모집글에는 지원할 수 없습니다.") {
      return res.status(400).json({
        success: false,
        error: "RECRUITMENT_CLOSED",
        message: error.message
      });
    }
    if (error.message === "유효하지 않은 포트폴리오 프로젝트가 포함되어 있습니다.") {
      return res.status(400).json({
        success: false,
        error: "INVALID_PORTFOLIO",
        message: error.message
      });
    }
    handleError(res, error);
  }
};

const getApplicants = async (req, res) => {
  try {
    const { recruitment_id } = req.params;  // URL 경로에서 recruitment_id 파라미터 받기
    const applicants = await applicationService.getApplicants(recruitment_id);
    res.status(200).json(applicants);  // 정상 응답 반환
  } catch (error) {
    handleError(res, error);  // 에러 처리
  }
};

const approveApplication = async (req, res) => {
  try {
    const { application_id } = req.params;
    const updatedApplication = await applicationService.updateApplicationStatus(application_id, "APPROVED");
    res.status(200).json({ message: "지원이 승인되었습니다.", updatedApplication });
  } catch (error) {
    handleError(res, error);
  }
};

const rejectApplication = async (req, res) => {
  try {
    const { application_id } = req.params;
    const updatedApplication = await applicationService.updateApplicationStatus(application_id, "REJECTED");
    res.status(200).json({ message: "지원이 거절되었습니다.", updatedApplication });
  } catch (error) {
    handleError(res, error);
  }
};

const getApplicationCount = async (req, res) => {
  try {
    const { recruitment_id } = req.params;
    const count = await applicationService.getApplicationCount(recruitment_id);
    res.status(200).json({ recruitment_id, applicationCount: count });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  applyToRecruitment,
  getApplicants,
  approveApplication,
  rejectApplication,
  getApplicationCount,
};
