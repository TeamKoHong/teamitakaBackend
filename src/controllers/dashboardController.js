const { Project, Recruitment, Application, ProjectMembers, Notification, Review } = require("../models");
const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");

// GET /api/dashboard/summary - 대시보드 요약 정보
exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.userId; // authMiddleware에서 설정됨

    // 1. 사용자가 속한 프로젝트 수
    const myProjectsCount = await ProjectMembers.count({
      where: { user_id: userId }
    });

    // 2. 내가 생성한 모집공고 수
    const myRecruitmentsCount = await Recruitment.count({
      where: { user_id: userId }
    });

    // 3. 내가 지원한 모집 수 (대기 중)
    const pendingApplicationsCount = await Application.count({
      where: {
        user_id: userId,
        status: 'PENDING'
      }
    });

    // 4. 읽지 않은 알림 수
    const unreadNotificationsCount = await Notification.count({
      where: {
        user_id: userId,
        is_read: false
      }
    }).catch(() => 0); // Notification 테이블이 없을 수도 있음

    // 5. 평가 대기 중인 프로젝트 수 (완료된 프로젝트 중 미평가)
    const completedProjectsQuery = `
      SELECT COUNT(DISTINCT pm.project_id) as pending_reviews_count
      FROM project_members pm
      JOIN projects p ON pm.project_id = p.project_id
      LEFT JOIN (
        SELECT project_id, COUNT(*) as review_count
        FROM reviews
        WHERE reviewer_id = :user_id
        GROUP BY project_id
      ) r ON pm.project_id = r.project_id
      LEFT JOIN (
        SELECT project_id, COUNT(*) as member_count
        FROM project_members
        GROUP BY project_id
      ) mc ON pm.project_id = mc.project_id
      WHERE pm.user_id = :user_id
        AND p.status = 'COMPLETED'
        AND mc.member_count > 1
        AND COALESCE(r.review_count, 0) < (mc.member_count - 1)
    `;

    const pendingReviewsResult = await sequelize.query(completedProjectsQuery, {
      replacements: { user_id: userId },
      type: QueryTypes.SELECT
    });
    const pendingReviewsCount = parseInt(pendingReviewsResult[0]?.pending_reviews_count || 0);

    // 6. 최근 활동 (최근 7일 이내)
    const recentActivities = await sequelize.query(`
      SELECT
        'project' as type,
        p.title,
        p.created_at as activity_date,
        'joined' as action
      FROM project_members pm
      JOIN projects p ON pm.project_id = p.project_id
      WHERE pm.user_id = :user_id
        AND pm.joined_at >= NOW() - INTERVAL '7 days'
      UNION ALL
      SELECT
        'application' as type,
        r.title,
        a.created_at as activity_date,
        'applied' as action
      FROM applications a
      JOIN recruitments r ON a.recruitment_id = r.recruitment_id
      WHERE a.user_id = :user_id
        AND a.created_at >= NOW() - INTERVAL '7 days'
      ORDER BY activity_date DESC
      LIMIT 10
    `, {
      replacements: { user_id: userId },
      type: QueryTypes.SELECT
    }).catch(() => []); // 에러 시 빈 배열 반환

    // 응답 반환
    return res.status(200).json({
      success: true,
      data: {
        projectCount: myProjectsCount,
        recruitmentCount: myRecruitmentsCount,
        pendingApplications: pendingApplicationsCount,
        unreadNotifications: unreadNotificationsCount,
        pendingReviews: pendingReviewsCount,
        recentActivities: recentActivities
      }
    });

  } catch (error) {
    console.error("🚨 getDashboardSummary Error:", error);
    return res.status(500).json({
      success: false,
      message: "대시보드 요약 정보 조회 실패",
      error: error.message
    });
  }
};
