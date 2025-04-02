const applicationService = require("../services/applicationService");
const { handleError } = require("../utils/errorHandler");

const applyToRecruitment = async (req, res) => {
  try {
    const { recruitment_id } = req.params;
    const user_id = res.locals.user.user_id;
    const application = await applicationService.applyToRecruitment(user_id, recruitment_id);
    res.status(201).json({ message: "지원이 완료되었습니다.", application });
  } catch (error) {
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
