const { Application, Recruitment, User } = require("../models");

const applyToRecruitment = async (user_id, recruitment_id) => {
  const recruitment = await Recruitment.findByPk(recruitment_id);
  if (!recruitment) throw new Error("모집공고가 존재하지 않습니다.");

  const existingApplication = await Application.findOne({ where: { recruitment_id, user_id } });
  if (existingApplication) throw new Error("이미 지원한 모집공고입니다.");

  return await Application.create({ recruitment_id, user_id });
};

const getApplicants = async (recruitment_id) => {
  return await Application.findAll({
    where: { recruitment_id },
    include: [{ model: User, attributes: ["user_id", "username", "email"] }],
  });
};

const updateApplicationStatus = async (application_id, status) => {
  const application = await Application.findByPk(application_id);
  if (!application) throw new Error("지원 정보를 찾을 수 없습니다.");

  application.status = status;
  await application.save();
  return application;
};

module.exports = {
  applyToRecruitment,
  getApplicants,
  updateApplicationStatus,
};
