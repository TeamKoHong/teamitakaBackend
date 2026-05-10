const recruitmentService = require("../services/recruitmentService");
const { handleError } = require("../utils/errorHandler");
// ★ [수정 1] 필요한 모델들(Scrap, Recruitment, RecruitmentView, User) 불러오기
const { Scrap, Recruitment, RecruitmentView, User } = require("../models");
const scrapService = require("../services/scrapService");

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getAllRecruitments = async (req, res) => {
  try {
    const user_id = req.user?.userId || null;
    const page = parsePositiveInt(req.query.page, 1);
    const pageSize = parsePositiveInt(req.query.pageSize || req.query.limit, 10);
    const { status, project_type } = req.query;

    // 로그인한 사용자의 학교 정보 조회 (학교별 필터링용)
    let userUniversity = null;
    if (user_id) {
      const user = await User.findByPk(user_id, { attributes: ['university'] });
      userUniversity = user?.university || null;
    }

    // 서비스에 학교 정보 전달 (전체 모드 없음 - 자기 학교만 표시)
    const result = await recruitmentService.getAllRecruitmentsWithApplicationCount(
      user_id,
      userUniversity,
      {
        status,
        project_type,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }
    );
    const items = Array.isArray(result) ? result : result.items || [];
    const total = Array.isArray(result) ? result.length : result.total || items.length;

    res.status(200).json({
      success: true,
      message: "모집글 목록을 조회했습니다",
      data: {
        items,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
          hasNextPage: page * pageSize < total,
          hasPreviousPage: page > 1,
        },
        filters: {
          university: userUniversity,
          status: status || null,
          project_type: project_type || null,
        },
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

const getMyRecruitments = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { limit = 10, offset = 0 } = req.query;

    const recruitments = await recruitmentService.getMyRecruitments(user_id, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json(recruitments);
  } catch (error) {
    handleError(res, error);
  }
};

// ★ [수정 2] 상세 조회 로직 대폭 수정 (조회수 중복 방지 + 북마크 여부 확인)
const getRecruitmentById = async (req, res) => {
  try {
    const { recruitment_id } = req.params;
    
    // 공개 상세 조회: 로그인 사용자는 조회 중복 방지와 스크랩 여부를 추가로 계산한다.
    const user_id = req.user?.userId || null;

    let recruitment = await recruitmentService.getRecruitmentById(recruitment_id);

    if (!recruitment) {
        return res.status(404).json({
          success: false,
          message: "모집글을 찾을 수 없습니다",
          error: {
            code: "RESOURCE_NOT_FOUND",
            resourceType: "recruitment",
            resourceId: recruitment_id,
          },
        });
    }

    if (user_id) {
      const alreadyViewed = await RecruitmentView.findOne({
        where: { user_id, recruitment_id }
      });

      if (!alreadyViewed) {
        await RecruitmentView.create({ user_id, recruitment_id });
        await Recruitment.increment({ views: 1 }, { where: { recruitment_id } });
      }
    }

    let recruitmentData = recruitment.toJSON ? recruitment.toJSON() : recruitment;

    let is_scrapped = false;
    if (user_id) {
      const scrap = await Scrap.findOne({
        where: { user_id, recruitment_id }
      });
      is_scrapped = !!scrap;
    }

    res.status(200).json({
      success: true,
      message: "모집글을 조회했습니다",
      data: {
        ...recruitmentData,
        is_scrapped: is_scrapped
      }
    });

  } catch (error) {
    handleError(res, error);
  }
};

const toggleScrap = async (req, res) => {
  try {
    const { recruitment_id } = req.params;
    const user_id = req.user.userId; // authMiddleware에서 획득

    // 서비스 로직 호출 (toggleScrap 함수가 문자열 메시지를 리턴한다고 가정)
    const message = await scrapService.toggleScrap(user_id, recruitment_id);
    
    // 성공 응답
    res.status(200).json({ message });
  } catch (error) {
    handleError(res, error);
  }
};

const createRecruitment = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { title, description, max_applicants, recruitment_start, recruitment_end, project_type, photo, photo_url, hashtags } = req.body;
    
    const newRecruitment = await recruitmentService.createRecruitment({
      title,
      description,
      max_applicants,
      user_id,
      recruitment_start,
      recruitment_end,
      project_type,
      photo_url: photo || photo_url,
      hashtags,
    });
    res.status(201).json(newRecruitment);
  } catch (error) {
    handleError(res, error);
  }
};

const updateRecruitment = async (req, res) => {
  try {
    const { recruitment_id } = req.params;
    const user_id = req.user.userId;
    const updatedRecruitment = await recruitmentService.updateRecruitment(recruitment_id, user_id, req.body);
    res.status(200).json({ message: "모집공고가 수정되었습니다.", updatedRecruitment });
  } catch (error) {
    handleError(res, error);
  }
};

const deleteRecruitment = async (req, res) => {
  try {
    const { recruitment_id } = req.params;
    const user_id = req.user.userId;
    await recruitmentService.deleteRecruitment(recruitment_id, user_id);
    res.status(200).json({ message: "모집공고가 삭제되었습니다." });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getAllRecruitments,
  getMyRecruitments,
  getRecruitmentById,
  createRecruitment,
  updateRecruitment,
  deleteRecruitment,
  toggleScrap,
};
