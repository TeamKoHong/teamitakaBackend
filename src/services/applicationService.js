const { Application, Recruitment, User, sequelize } = require("../models");

const applyToRecruitment = async (user_id, recruitment_id) => {
  const recruitment = await Recruitment.findByPk(recruitment_id);
  if (!recruitment) throw new Error("모집공고가 존재하지 않습니다.");

  // 중복 지원 확인
  const existingApplication = await Application.findOne({ where: { recruitment_id, user_id } });
  if (existingApplication) throw new Error("이미 지원한 모집공고입니다.");

  // 지원 생성
  const application = await Application.create({ recruitment_id, user_id });

  // 지원자 수 증가
  const applicationCount = await Application.count({ where: { recruitment_id } });

  // 모집 정원이 다 찼다면 상태 변경
  if (applicationCount >= recruitment.max_applicants) {
    await recruitment.update({ status: "CLOSED" });
  }

  return application;
};

const getApplicants = async (recruitment_id) => {
  return await Application.findAll({
    where: { recruitment_id },
    include: [{
      model: User,
      attributes: [
        "user_id",
        "username",
        "email",
        "university",
        "major",
        "skills",
        "experience_years",
        "avatar",
        "bio",
        "awards",
        "portfolio_url"
      ]
    }],
  });
};

const updateApplicationStatus = async (application_id, status) => {
  const application = await Application.findByPk(application_id);
  if (!application) throw new Error("지원 정보를 찾을 수 없습니다.");

  // 지원 상태 변경
  application.status = status;
  await application.save();

  // 모집공고 지원자 수 다시 확인
  const recruitment = await Recruitment.findByPk(application.recruitment_id);
  const applicationCount = await Application.count({ where: { recruitment_id: application.recruitment_id } });

  // 승인된 인원이 max_applicants보다 작다면 모집 상태를 다시 OPEN으로 변경
  if (status === "REJECTED" && recruitment.status === "CLOSED") {
    if (applicationCount < recruitment.max_applicants) {
      await recruitment.update({ status: "OPEN" });
    }
  }

  return application;
};

const getApplicationCount = async (recruitment_id) => {
  return await Application.count({ where: { recruitment_id } });
};

module.exports = {
  applyToRecruitment,
  getApplicants,
  updateApplicationStatus,
  getApplicationCount,
};
