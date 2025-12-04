const { Application, ApplicationPortfolio, Recruitment, User, Project, sequelize } = require("../models");

const applyToRecruitment = async (user_id, recruitment_id, introduction, portfolio_project_ids = []) => {
  const recruitment = await Recruitment.findByPk(recruitment_id);
  if (!recruitment) throw new Error("모집공고가 존재하지 않습니다.");

  // 본인이 작성한 모집글인지 확인
  if (recruitment.user_id === user_id) {
    throw new Error("본인이 작성한 모집글에는 지원할 수 없습니다.");
  }

  // 모집 마감 확인
  if (recruitment.status === "CLOSED") {
    throw new Error("마감된 모집글에는 지원할 수 없습니다.");
  }

  // 중복 지원 확인
  const existingApplication = await Application.findOne({ where: { recruitment_id, user_id } });
  if (existingApplication) throw new Error("이미 지원한 모집공고입니다.");

  // 포트폴리오 프로젝트 유효성 검증
  if (portfolio_project_ids && portfolio_project_ids.length > 0) {
    const projects = await Project.findAll({
      where: {
        project_id: portfolio_project_ids,
      },
      include: [{
        model: require("../models").ProjectMembers,
        where: { user_id },
        required: true,
      }],
    });

    if (projects.length !== portfolio_project_ids.length) {
      throw new Error("유효하지 않은 포트폴리오 프로젝트가 포함되어 있습니다.");
    }
  }

  // 트랜잭션으로 원자성 보장
  const transaction = await sequelize.transaction();

  try {
    // 지원 생성
    const application = await Application.create(
      { recruitment_id, user_id, introduction },
      { transaction }
    );

    // 포트폴리오 연결
    if (portfolio_project_ids && portfolio_project_ids.length > 0) {
      const portfolioRecords = portfolio_project_ids.map(project_id => ({
        application_id: application.application_id,
        project_id,
      }));
      await ApplicationPortfolio.bulkCreate(portfolioRecords, { transaction });
    }

    // 지원자 수 증가
    const applicationCount = await Application.count({ where: { recruitment_id }, transaction });

    // 모집 정원이 다 찼다면 상태 변경
    if (applicationCount >= recruitment.max_applicants) {
      await recruitment.update({ status: "CLOSED" }, { transaction });
    }

    await transaction.commit();

    // 포트폴리오 정보 포함하여 반환
    const applicationWithPortfolio = await Application.findByPk(application.application_id, {
      include: [{
        model: ApplicationPortfolio,
        include: [{
          model: Project,
          attributes: ["project_id", "title", "description"],
        }],
      }],
    });

    return applicationWithPortfolio;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getApplicants = async (recruitment_id) => {
  return await Application.findAll({
    where: { recruitment_id },
    include: [
      {
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
      },
      {
        model: ApplicationPortfolio,
        include: [{
          model: Project,
          attributes: ["project_id", "title", "description"]
        }]
      }
    ],
  });
};

const updateApplicationStatus = async (application_id, status) => {
  const application = await Application.findByPk(application_id);
  if (!application) throw new Error("지원 정보를 찾을 수 없습니다.");

  // 이미 같은 상태인 경우 중복 처리 방지
  if (application.status === status) {
    if (status === "ACCEPTED") {
      throw new Error("이미 승인된 지원입니다.");
    }
    if (status === "REJECTED") {
      throw new Error("이미 거절된 지원입니다.");
    }
    return application; // 멱등성 보장
  }

  // 지원 상태 변경
  application.status = status;
  await application.save();

  // 모집공고 지원자 수 다시 확인
  const recruitment = await Recruitment.findByPk(application.recruitment_id);
  const applicationCount = await Application.count({ where: { recruitment_id: application.recruitment_id } });

  // 승인된 인원이 max_applicants보다 작다면 모집 상태를 다시 ACTIVE로 변경
  if (status === "REJECTED" && recruitment.status === "CLOSED") {
    if (applicationCount < recruitment.max_applicants) {
      await recruitment.update({ status: "ACTIVE" });
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
