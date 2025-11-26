const { Recruitment, Project, Hashtag, Application, sequelize } = require("../models");
const { Op } = require("sequelize");

// 🔥 1. 전체 모집공고 가져오기 (이미지, 조회수, 프로젝트 타입, 지원자 수 포함)
const getAllRecruitmentsWithApplicationCount = async () => {
  return await Recruitment.findAll({
    attributes: [
      "recruitment_id",
      "title",
      "description",
      "status",
      "created_at",   
      "photo_url",    
      "views",        
      "project_type", 
      "created_at",   // DB 컬럼명 (createdAt vs created_at 주의)
      "photo_url",    // ★ [핵심] 목록 페이지에 이미지를 띄우기 위해 필수
      "views",        // ★ Hot 공고 정렬 및 조회수 표시에 필요
      "project_type", // ★ '수업' vs '사이드' 구분에 필요
      [
        sequelize.literal(`(
          SELECT COUNT(*) FROM applications AS a
          WHERE a.recruitment_id = "Recruitment"."recruitment_id"
        )`),
        "applicationCount",
      ],
    ],
<<<<<<< HEAD
    // ★ include는 attributes 배열 밖, findAll 객체 안에 있어야 합니다.
=======
    // ★ [핵심] 해시태그 모델을 include 해야 필터링 및 태그 표시가 가능합니다.
>>>>>>> 18ab319f0e53bc577cde5bcb985d4bc88bf4f733
    include: [{
      model: Hashtag,
      attributes: ["name"], 
      through: { attributes: [] } 
    }],
    // ★ order도 마찬가지로 findAll 객체의 속성입니다.
    order: [
      [sequelize.literal('"applicationCount"'), "DESC"], 
      ["created_at", "DESC"]
      attributes: ["name"], // (주의: DB 컬럼명이 content라면 "content"로 변경 필요)
      through: { attributes: [] } // 중간 테이블 데이터 제외
    }],
    order: [
      [sequelize.literal("applicationCount"), "DESC"], // 지원자 순 정렬
      ["created_at", "DESC"] // (선택) 최신순 보조 정렬
    ],
  });
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

// 👀 3. 상세 조회 (조회수 증가 포함)
const getRecruitmentById = async (recruitment_id, cookies, setCookie) => {
  let viewedRecruitments = cookies && cookies.viewedRecruitments 
    ? JSON.parse(cookies.viewedRecruitments) 
    : [];

  if (!viewedRecruitments.includes(recruitment_id)) {
    await Recruitment.increment("views", { where: { recruitment_id } });
    viewedRecruitments.push(recruitment_id);
    
    if (setCookie) {
        setCookie("viewedRecruitments", JSON.stringify(viewedRecruitments), {
        maxAge: 60 * 60 * 1000, 
        httpOnly: true,
        });
    }
  }

  return await Recruitment.findByPk(recruitment_id, {
    attributes: [
        'recruitment_id', 'title', 'description', 'status', 'user_id', 
        'project_id', 'views', 'max_applicants', 'recruitment_start', 
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