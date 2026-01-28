const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");
const NodeCache = require("node-cache");

// 1시간(3600초) TTL 캐시 설정
const statsCache = new NodeCache({
  stdTTL: 3600,
  checkperiod: 600,
});

const CACHE_KEY = "type-test-stats";

/**
 * 성향테스트 참여자 통계 조회
 * GET /api/type-test/stats
 * 인증 불필요 (공개 통계 정보)
 */
exports.getStats = async (req, res) => {
  try {
    // 캐시 확인
    const cachedStats = statsCache.get(CACHE_KEY);
    if (cachedStats) {
      return res.status(200).json(cachedStats);
    }

    // 성향테스트 완료한 사용자 수 집계
    const result = await sequelize.query(
      "SELECT COUNT(*) as count FROM users WHERE mbti_type IS NOT NULL",
      { type: QueryTypes.SELECT }
    );

    const participantCount = parseInt(result[0]?.count || 0, 10);
    const updatedAt = new Date().toISOString();

    const responseData = {
      participant_count: participantCount,
      updated_at: updatedAt,
    };

    // 캐시 저장
    statsCache.set(CACHE_KEY, responseData);

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("성향테스트 통계 조회 오류:", error);
    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "통계 조회에 실패했습니다.",
    });
  }
};
