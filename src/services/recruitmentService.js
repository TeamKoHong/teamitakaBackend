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
      "created_at",
      [
        sequelize.literal(`(
          SELECT COUNT(*) FROM applications AS a
          WHERE a.recruitment_id = "Recruitment"."recruitment_id"
        )`),
        "applicationCount",
      ],
    ],
    include: [{
      model: Hashtag,
      attributes: ["name"],
      through: { attributes: [] } // 중간 테이블 데이터 제외
    }],
    order: [
      [
        sequelize.literal(`(
          SELECT COUNT(*) FROM applications AS a
          WHERE a.recruitment_id = "Recruitment"."recruitment_id"
        )`),
        "DESC"
      ]
    ], // 지원 수 기준 정렬
  });
};

// 📋 내가 작성한 모집공고 목록 조회 (조회수 증가 X)
const getMyRecruitments = async (user_id, { limit, offset }) => {
  const { count, rows } = await Recruitment.findAndCountAll({
    where: { user_id },
    attributes: [
      'recruitment_id',
      'title',
      'description',
      'status',
      'user_id',
      'project_id',
      'views',
      'max_applicants',
      'recruitment_start',
      'recruitment_end',
      'project_type',
      'photo_url',
      'created_at',
      'updated_at',
      [
        sequelize.literal(`(
          SELECT COUNT(*) FROM applications AS a
          WHERE a.recruitment_id = "Recruitment"."recruitment_id"
        )`),
        'applicant_count',
      ],
    ],
    include: [{
      model: Hashtag,
      attributes: ["name"]
    }],
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return {
    success: true,
    items: rows,
    page: {
      total: count,
      limit,
      offset
    }
  };
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
    attributes: [
      'recruitment_id',
      'title',
      'description',
      'status',
      'user_id',              // 작성자 ID (프론트엔드 소유자 확인용)
      'project_id',
      'views',
      'max_applicants',
      'recruitment_start',
      'recruitment_end',
      'project_type',
      'photo_url',
      'created_at',           // 생성 시간
      'updated_at',
      [
        sequelize.literal(`(
          SELECT COUNT(*) FROM applications AS a
          WHERE a.recruitment_id = "Recruitment"."recruitment_id"
        )`),
        'applicant_count',    // 지원자 수
      ],
    ],
    include: [{
      model: Hashtag,
      attributes: ["name"]    // 수정: "content" → "name"
    }],
  });
};

// 📌 모집공고 생성
const createRecruitment = async ({ title, description, max_applicants, user_id, recruitment_start, recruitment_end, project_type, photo_url, hashtags }) => {
  const recruitment = await Recruitment.create({
    title,
    description,
    max_applicants,
    user_id,
    recruitment_start,
    recruitment_end,
    project_type,
    photo_url,
    status: "OPEN", // 모델 ENUM("OPEN", "CLOSED")과 일치
  });

  // 해시태그 처리
  if (hashtags && Array.isArray(hashtags) && hashtags.length > 0) {
    // # 기호 제거 및 유효성 검사
    const cleanedTags = hashtags
      .map(tag => tag.replace(/^#/, '').trim()) // # 제거
      .filter(tag => tag.length > 0) // 빈 문자열 제거
      .filter((tag, index, self) => self.indexOf(tag) === index) // 중복 제거
      .slice(0, 5); // 최대 5개

    if (cleanedTags.length > 0) {
      const hashtagResults = await Promise.all(
        cleanedTags.map(tag => Hashtag.findOrCreate({ where: { name: tag } }))
      );
      await recruitment.setHashtags(hashtagResults.map(([tag]) => tag));
    }
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
      hashtags.map(tag => Hashtag.findOrCreate({ where: { name: tag } }))
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
  getMyRecruitments,
  getRecruitmentById,
  createRecruitment,
  updateRecruitment,
  deleteRecruitment,
};
