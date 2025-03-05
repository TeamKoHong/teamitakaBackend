const { Recruitment, Project, Hashtag, Application, sequelize } = require("../models");
const { Op } = require("sequelize");

// 🔥 지원자 수 포함해서 모집공고 가져오기 (핫 게시물 기능 추가)
const getAllRecruitmentsWithApplicationCount = async () => {
  return await Recruitment.findAll({
    attributes: [
      "recruitment_id",
      "title",
      "description",
      "status",
      "createdAt",
      [
        sequelize.literal(`(
          SELECT COUNT(*) FROM Applications AS a
          WHERE a.recruitment_id = Recruitment.recruitment_id
        )`),
        "applicationCount",
      ],
    ],
    order: [[sequelize.literal("applicationCount"), "DESC"]], // 지원 수 기준 정렬
  });
};

// 👀 조회수 증가 로직 최적화
const getRecruitmentById = async (recruitment_id, cookies, setCookie) => {
  let viewedRecruitments = cookies.viewedRecruitments ? JSON.parse(cookies.viewedRecruitments) : [];

  if (!viewedRecruitments.includes(recruitment_id)) {
    await Recruitment.increment("views", { where: { recruitment_id } });
    viewedRecruitments.push(recruitment_id);
    setCookie("viewedRecruitments", JSON.stringify(viewedRecruitments), {
      maxAge: 60 * 60 * 1000, // 1시간
      httpOnly: true,
    });
  }

  return await Recruitment.findByPk(recruitment_id, {
    include: [{ model: Hashtag, attributes: ["content"] }],
  });
};

// 📌 모집공고 생성 (태그, 이미지 저장 포함)
const createRecruitment = async ({ title, description, status, start_date, end_date, hashtags, is_draft, user_id, photoPath }) => {
  const recruitment = await Recruitment.create({
    title,
    description,
    status: is_draft ? "임시저장" : status,
    start_date,
    end_date,
    user_id,
    is_draft: is_draft || false,
    photo: photoPath || null,
  });

  if (hashtags && hashtags.length > 0) {
    const hashtagResults = await Promise.all(
      hashtags.map(tag => Hashtag.findOrCreate({ where: { content: tag } }))
    );
    await recruitment.addHashtags(hashtagResults.map(([tag]) => tag));
  }

  return recruitment;
};

// ✏ 모집공고 수정
const updateRecruitment = async (recruitment_id, { title, description, status, start_date, end_date, hashtags }) => {
  const recruitment = await Recruitment.findByPk(recruitment_id);
  if (!recruitment) throw new Error("모집공고가 존재하지 않습니다.");

  // 모집이 마감될 때 프로젝트 자동 생성
  if (status === "closed" && recruitment.status !== "closed") {
    const existingProject = await Project.findOne({ where: { recruitment_id } });
    if (!existingProject) {
      await Project.create({
        title: recruitment.title,
        description: recruitment.description,
        user_id: recruitment.user_id,
        recruitment_id: recruitment.recruitment_id,
      });
    }
  }

  // 모집공고 업데이트
  await recruitment.update({ title, description, status, start_date, end_date });

  // 해시태그 업데이트
  if (hashtags && hashtags.length > 0) {
    const hashtagResults = await Promise.all(
      hashtags.map(tag => Hashtag.findOrCreate({ where: { content: tag } }))
    );
    await recruitment.setHashtags(hashtagResults.map(([tag]) => tag));
  }

  return recruitment;
};

// ❌ 모집공고 삭제 (연관된 해시태그 연결 해제 후 삭제)
const deleteRecruitment = async (recruitment_id) => {
  const recruitment = await Recruitment.findByPk(recruitment_id);
  if (!recruitment) throw new Error("삭제할 모집공고가 없습니다.");

  await recruitment.setHashtags([]); // 해시태그 연결 해제
  await recruitment.destroy();
};

module.exports = {
  getAllRecruitmentsWithApplicationCount,
  getRecruitmentById,
  createRecruitment,
  updateRecruitment,
  deleteRecruitment,
};
