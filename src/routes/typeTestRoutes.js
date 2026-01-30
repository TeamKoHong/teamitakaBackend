const express = require("express");
const router = express.Router();
const typeTestController = require("../controllers/typeTestController");

/**
 * 성향테스트 관련 API 라우트
 * Base path: /api/type-test
 */

// GET /api/type-test/stats - 참여자 통계 조회 (인증 불필요)
router.get("/stats", typeTestController.getStats);

module.exports = router;
