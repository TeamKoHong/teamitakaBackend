const applicationService = require("../services/applicationService");
const { handleError } = require("../utils/errorHandler");

const applyToRecruitment = async (req, res) => {
  try {
    const { recruitment_id } = req.params;
    const user_id = res.locals.user.user_id;
    const application = await applicationService.applyToRecruitment(user_id, recruitment_id);
    res.status(201).send(application);
  } catch (error) {
    handleError(res, error);
  }
};

const getApplicants = async (req, res) => {
  try {
    const { recruitment_id } = req.params;
    const applicants = await applicationService.getApplicants(recruitment_id);
    res.status(200).send(applicants);
  } catch (error) {
    handleError(res, error);
  }
};

const approveApplication = async (req, res) => {
  try {
    const { application_id } = req.params;
    const updatedApplication = await applicationService.updateApplicationStatus(application_id, "APPROVED");
    res.status(200).send({ message: "지원이 승인되었습니다.", updatedApplication });
  } catch (error) {
    handleError(res, error);
  }
};

const rejectApplication = async (req, res) => {
  try {
    const { application_id } = req.params;
    const updatedApplication = await applicationService.updateApplicationStatus(application_id, "REJECTED");
    res.status(200).send({ message: "지원이 거절되었습니다.", updatedApplication });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  applyToRecruitment,
  getApplicants,
  approveApplication,
  rejectApplication,
};
