/**
 * Evaluation Controller
 *
 * 프론트엔드 E2E 테스트(M07 상호평가 모듈)를 위한 /api/evaluations 엔드포인트 제공
 * 기존 reviewService를 래핑하여 필드 매핑 처리
 *
 * 필드 매핑:
 * - 프론트엔드: participation, communication, responsibility, cooperation, ability, overall
 * - 백엔드: effort, communication, commitment, reflection, ability, overall_rating
 */

const reviewService = require("../services/reviewService");
const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");

// 프론트엔드 → 백엔드 필드 매핑
const frontendToBackend = {
  participation: "effort",
  communication: "communication",
  responsibility: "commitment",
  cooperation: "reflection",
  ability: "ability",
  overall: "overall_rating",
};

// 백엔드 → 프론트엔드 필드 매핑
const backendToFrontend = {
  effort: "participation",
  communication: "communication",
  commitment: "responsibility",
  reflection: "cooperation",
  ability: "ability",
  overall_rating: "overall",
};

/**
 * 프론트엔드 필드를 백엔드 필드로 변환
 */
function mapToBackendFields(frontendData) {
  const backendData = { ...frontendData };

  // ratings 객체가 있으면 펼치기
  if (frontendData.ratings) {
    Object.assign(backendData, frontendData.ratings);
    delete backendData.ratings;
  }

  // 필드 매핑 적용
  for (const [frontKey, backKey] of Object.entries(frontendToBackend)) {
    if (backendData[frontKey] !== undefined) {
      backendData[backKey] = backendData[frontKey];
      if (frontKey !== backKey) {
        delete backendData[frontKey];
      }
    }
  }

  // 추가 필드 매핑
  if (backendData.project_id === undefined && backendData.projectId) {
    backendData.project_id = backendData.projectId;
    delete backendData.projectId;
  }
  if (backendData.target_member_id) {
    backendData.reviewee_id = backendData.target_member_id;
    delete backendData.target_member_id;
  }
  if (backendData.role_description === undefined && backendData.roleDescription) {
    backendData.role_description = backendData.roleDescription;
    delete backendData.roleDescription;
  }

  return backendData;
}

/**
 * 백엔드 필드를 프론트엔드 필드로 변환
 */
function mapToFrontendFields(backendData) {
  if (!backendData) return null;

  const frontendData = { ...backendData };

  // 필드 매핑 적용
  for (const [backKey, frontKey] of Object.entries(backendToFrontend)) {
    if (frontendData[backKey] !== undefined) {
      frontendData[frontKey] = frontendData[backKey];
      if (backKey !== frontKey) {
        delete frontendData[backKey];
      }
    }
  }

  // 추가 필드 변환
  if (frontendData.reviewee_id) {
    frontendData.target_member_id = frontendData.reviewee_id;
  }
  if (frontendData.reviewee_username) {
    frontendData.target_member_name = frontendData.reviewee_username;
  }
  if (frontendData.created_at) {
    frontendData.evaluated_at = frontendData.created_at;
  }

  return frontendData;
}

/**
 * POST /api/evaluations
 * 평가 생성 (필드 매핑 적용)
 */
exports.createEvaluation = async (req, res) => {
  try {
    const reviewerId = req.user.userId;

    // 프론트엔드 필드를 백엔드 필드로 변환
    const backendData = mapToBackendFields(req.body);
    backendData.reviewer_id = reviewerId;

    // 유효성 검사
    const requiredFields = [
      "project_id",
      "reviewee_id",
      "ability",
      "effort",
      "commitment",
      "communication",
      "reflection",
      "overall_rating",
    ];

    for (const field of requiredFields) {
      if (backendData[field] === undefined) {
        return res.status(400).json({
          success: false,
          message: `필수 필드가 누락되었습니다: ${field}`,
        });
      }
    }

    // 평점 범위 검사 (1-5)
    const ratingFields = [
      "ability",
      "effort",
      "commitment",
      "communication",
      "reflection",
      "overall_rating",
    ];
    for (const field of ratingFields) {
      const value = backendData[field];
      if (value < 1 || value > 5) {
        return res.status(400).json({
          success: false,
          message: `평점은 1-5 사이여야 합니다: ${field}`,
        });
      }
    }

    // 자기 자신 평가 방지
    if (backendData.reviewer_id === backendData.reviewee_id) {
      return res.status(400).json({
        success: false,
        message: "자기 자신은 평가할 수 없습니다",
      });
    }

    // 중복 평가 확인
    const [existing] = await sequelize.query(
      `SELECT review_id FROM reviews
       WHERE project_id = :project_id
       AND reviewer_id = :reviewer_id
       AND reviewee_id = :reviewee_id`,
      {
        replacements: {
          project_id: backendData.project_id,
          reviewer_id: backendData.reviewer_id,
          reviewee_id: backendData.reviewee_id,
        },
        type: QueryTypes.SELECT,
      }
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "이미 해당 팀원을 평가했습니다",
      });
    }

    // 리뷰 생성
    const review = await reviewService.createReview(backendData);

    // 응답을 프론트엔드 형식으로 변환
    const frontendResponse = mapToFrontendFields(review);

    res.status(201).json({
      success: true,
      message: "평가가 완료되었습니다",
      data: frontendResponse,
    });
  } catch (error) {
    console.error("🚨 createEvaluation Error:", error);
    res.status(500).json({
      success: false,
      message: "평가 생성 중 오류가 발생했습니다",
      error: error.message,
    });
  }
};

/**
 * GET /api/evaluations/given?projectId=xxx
 * 내가 한 평가 조회
 */
exports.getGivenEvaluations = async (req, res) => {
  try {
    const reviewerId = req.user.userId;
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "projectId 쿼리 파라미터가 필요합니다",
      });
    }

    const reviews = await reviewService.getReviewsByReviewer(
      projectId,
      reviewerId
    );

    // 프론트엔드 형식으로 변환
    const frontendReviews = reviews.map((review) => mapToFrontendFields(review));

    res.json({
      success: true,
      data: {
        given_evaluations: frontendReviews,
        total: frontendReviews.length,
      },
    });
  } catch (error) {
    console.error("🚨 getGivenEvaluations Error:", error);
    res.status(500).json({
      success: false,
      message: "평가 조회 중 오류가 발생했습니다",
      error: error.message,
    });
  }
};

/**
 * GET /api/evaluations/received
 * 내가 받은 평가 조회
 */
exports.getReceivedEvaluations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { projectId } = req.query;

    let reviews;

    if (projectId) {
      // 특정 프로젝트의 받은 평가
      reviews = await sequelize.query(
        `SELECT
          r.*,
          u.username as reviewer_username
        FROM reviews r
        JOIN users u ON r.reviewer_id = u.user_id
        WHERE r.reviewee_id = :userId AND r.project_id = :projectId
        ORDER BY r.created_at DESC`,
        {
          replacements: { userId, projectId },
          type: QueryTypes.SELECT,
        }
      );
    } else {
      // 모든 받은 평가
      reviews = await reviewService.getReviewsByUser(userId);
    }

    // 프론트엔드 형식으로 변환
    const frontendReviews = reviews.map((review) => ({
      ...mapToFrontendFields(review),
      reviewer_name: review.reviewer_username,
    }));

    // 평균 평점 계산
    let averageRating = 0;
    if (frontendReviews.length > 0) {
      const totalOverall = frontendReviews.reduce(
        (sum, r) => sum + (r.overall || 0),
        0
      );
      averageRating = (totalOverall / frontendReviews.length).toFixed(2);
    }

    res.json({
      success: true,
      data: {
        items: frontendReviews,
        average_rating: parseFloat(averageRating),
        total: frontendReviews.length,
      },
    });
  } catch (error) {
    console.error("🚨 getReceivedEvaluations Error:", error);
    res.status(500).json({
      success: false,
      message: "받은 평가 조회 중 오류가 발생했습니다",
      error: error.message,
    });
  }
};

/**
 * GET /api/evaluations/pending
 * 미완료 평가 목록 조회
 */
exports.getPendingEvaluations = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 사용자가 속한 COMPLETED 프로젝트에서 아직 평가하지 않은 팀원 조회
    const pendingEvaluations = await sequelize.query(
      `SELECT
        p.project_id,
        p.title as project_title,
        pm_target.user_id as target_member_id,
        u.username as target_member_name,
        pm_target.role as target_member_role,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.project_id) - 1 as total_members,
        (SELECT COUNT(*) FROM reviews WHERE project_id = p.project_id AND reviewer_id = :userId) as completed_evaluations
      FROM projects p
      JOIN project_members pm ON p.project_id = pm.project_id AND pm.user_id = :userId
      JOIN project_members pm_target ON p.project_id = pm_target.project_id AND pm_target.user_id != :userId
      JOIN users u ON pm_target.user_id = u.user_id
      LEFT JOIN reviews r ON r.project_id = p.project_id
        AND r.reviewer_id = :userId
        AND r.reviewee_id = pm_target.user_id
      WHERE p.status = 'COMPLETED'
        AND r.review_id IS NULL
      ORDER BY p.updated_at DESC, u.username ASC`,
      {
        replacements: { userId },
        type: QueryTypes.SELECT,
      }
    );

    // 프로젝트별로 그룹화
    const projectsMap = new Map();

    for (const evaluation of pendingEvaluations) {
      if (!projectsMap.has(evaluation.project_id)) {
        projectsMap.set(evaluation.project_id, {
          project_id: evaluation.project_id,
          project_title: evaluation.project_title,
          total_members: parseInt(evaluation.total_members),
          completed_evaluations: parseInt(evaluation.completed_evaluations),
          pending_members: [],
        });
      }

      projectsMap.get(evaluation.project_id).pending_members.push({
        member_id: evaluation.target_member_id,
        name: evaluation.target_member_name,
        role: evaluation.target_member_role,
        evaluation_status: "NOT_EVALUATED",
      });
    }

    const projects = Array.from(projectsMap.values()).map((project) => ({
      ...project,
      pending_count: project.pending_members.length,
      progress: `${project.completed_evaluations}/${project.total_members}`,
    }));

    res.json({
      success: true,
      data: {
        projects,
        total_pending: pendingEvaluations.length,
      },
    });
  } catch (error) {
    console.error("🚨 getPendingEvaluations Error:", error);
    res.status(500).json({
      success: false,
      message: "미완료 평가 조회 중 오류가 발생했습니다",
      error: error.message,
    });
  }
};
