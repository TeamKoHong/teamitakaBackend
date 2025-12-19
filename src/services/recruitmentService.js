const { Recruitment, Project, Hashtag, Application, Scrap, sequelize } = require("../models");
const { Op } = require("sequelize");

// 🔥 1. 전체 모집공고 가져오기 (로그인 시 is_scrapped 포함)
const getAllRecruitmentsWithApplicationCount = async (user_id = null) => {
  const recruitments = await Recruitment.findAll({
    attributes: [
      "recruitment_id",
      "title",
      "description",
      "status",
      "created_at",
      "photo_url",
      "views",
      "project_type",
      "scrap_count", // ★ [수정] 목록에서도 북마크 수 반환
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
      through: { attributes: [] }
    }],
    order: [
      [sequelize.literal('"applicationCount"'), "DESC"],
      ["created_at", "DESC"]
    ],
  });

  // user_id가 있으면 스크랩 여부 확인
  let userScraps = [];
  if (user_id) {
    const scraps = await Scrap.findAll({
      where: { user_id },
      attributes: ['recruitment_id']
    });
    userScraps = scraps.map(s => s.recruitment_id);
  }

  // is_scrapped 추가하여 반환
  return recruitments.map(r => ({
    ...(r.toJSON ? r.toJSON() : r),
    is_scrapped: user_id ? userScraps.includes(r.recruitment_id) : false
  }));
};

// 📋 2. 내가 작성한 모집공고 목록 조회
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
      'scrap_count', // ★ [수정] 북마크 수 추가
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

// 👀 3. 상세 조회
// ★ [수정] 쿠키 로직 및 increment 로직 제거 (컨트롤러에서 RecruitmentView로 처리함)
const getRecruitmentById = async (recruitment_id) => {
  return await Recruitment.findByPk(recruitment_id, {
    attributes: [
        'recruitment_id', 'title', 'description', 'status', 'user_id',
        'project_id', 'views', 'scrap_count', // ★ [수정] 북마크 수 포함
        'max_applicants', 'recruitment_start',
        'recruitment_end', 'project_type', 'photo_url', 'created_at', 'updated_at',
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
  });
};

// 📌 4. 모집공고 생성
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
    status: "ACTIVE",
    scrap_count: 0, // 초기값 명시 (모델 default가 0이라 생략 가능하지만 명시적으로 적음)
  });

  if (hashtags && Array.isArray(hashtags) && hashtags.length > 0) {
    const cleanedTags = hashtags
      .map(tag => tag.replace(/^#/, '').trim())
      .filter(tag => tag.length > 0);

    if (cleanedTags.length > 0) {
      const hashtagResults = await Promise.all(
        cleanedTags.map(tag => Hashtag.findOrCreate({ where: { name: tag } }))
      );
      await recruitment.setHashtags(hashtagResults.map(([tag]) => tag));
    }
  }

  return recruitment;
};

// ✏ 5. 모집공고 수정
const updateRecruitment = async (recruitment_id, { title, description, status, start_date, end_date, hashtags }) => {
  const recruitment = await Recruitment.findByPk(recruitment_id);
  if (!recruitment) throw new Error("모집공고가 존재하지 않습니다.");

  if (status === "CLOSED" && recruitment.status !== "CLOSED") {
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

  await recruitment.update({
      title,
      description,
      status,
      recruitment_start: start_date,
      recruitment_end: end_date
  });

  if (hashtags && Array.isArray(hashtags)) {
    const cleanedTags = hashtags
      .map(tag => tag.replace(/^#/, '').trim())
      .filter(tag => tag.length > 0);

    const hashtagResults = await Promise.all(
      cleanedTags.map(tag => Hashtag.findOrCreate({ where: { name: tag } }))
    );
    await recruitment.setHashtags(hashtagResults.map(([tag]) => tag));
  }

  return recruitment;
};

// ❌ 6. 모집공고 삭제
const deleteRecruitment = async (recruitment_id) => {
  const recruitment = await Recruitment.findByPk(recruitment_id);
  if (!recruitment) throw new Error("삭제할 모집공고가 없습니다.");

  await recruitment.setHashtags([]);
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