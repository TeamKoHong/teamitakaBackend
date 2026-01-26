const recruitmentService = require("../services/recruitmentService");
const { handleError } = require("../utils/errorHandler");
// ★ [수정 1] 필요한 모델들(Scrap, Recruitment, RecruitmentView, User) 불러오기
const { Scrap, Recruitment, RecruitmentView, User } = require("../models");
const scrapService = require("../services/scrapService");
const { toPairs } = require("lodash");

const getAllRecruitments = async (req, res) => {
  try {
    const user_id = req.user?.userId || null;

    // 로그인한 사용자의 학교 정보 조회 (학교별 필터링용)
    let userUniversity = null;
    if (user_id) {
      const user = await User.findByPk(user_id, { attributes: ['university'] });
      userUniversity = user?.university || null;
    }

    // 서비스에 학교 정보 전달 (전체 모드 없음 - 자기 학교만 표시)
    const recruitments = await recruitmentService.getAllRecruitmentsWithApplicationCount(
      user_id,
      userUniversity
    );
    res.status(200).json(recruitments);
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
    
    // 1. 유저 ID 확보 (authMiddleware 덕분에 로그인했다면 무조건 있음)
    const user_id = req.user.userId;

    // =========================================================
    // 🔥 [조회수 중복 방지 로직]
    // =========================================================
    // 이 유저가 이 글을 본 적이 있는지 확인
    const alreadyViewed = await RecruitmentView.findOne({
      where: { user_id, recruitment_id }
    });

    // 본 적이 없다면 -> 기록 남기고 조회수 +1
    if (!alreadyViewed) {
      await RecruitmentView.create({ user_id, recruitment_id });
      await Recruitment.increment({ views: 1 }, { where: { recruitment_id } });
    }
    // =========================================================

    // 2. 서비스에서 모집글 정보 가져오기 (쿠키 로직 제거됨)
    let recruitment = await recruitmentService.getRecruitmentById(recruitment_id);

    if (!recruitment) {
        return res.status(404).json({ message: "모집공고를 찾을 수 없습니다." });
    }

    // Sequelize 객체를 일반 JSON 객체로 변환
    let recruitmentData = recruitment.toJSON ? recruitment.toJSON() : recruitment;

    // 3. 내가 스크랩했는지 여부(is_scrapped) 확인
    let is_scrapped = false;
    const scrap = await Scrap.findOne({
      where: { user_id, recruitment_id }
    });
    is_scrapped = !!scrap;

    // 4. 응답 (is_scrapped 포함)
    res.status(200).json({
      ...recruitmentData,
      is_scrapped: is_scrapped
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
    const updatedRecruitment = await recruitmentService.updateRecruitment(recruitment_id, req.body);
    res.status(200).json({ message: "모집공고가 수정되었습니다.", updatedRecruitment });
  } catch (error) {
    handleError(res, error);
  }
};

const deleteRecruitment = async (req, res) => {
  try {
    const { recruitment_id } = req.params;
    await recruitmentService.deleteRecruitment(recruitment_id);
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