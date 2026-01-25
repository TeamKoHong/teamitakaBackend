/**
 * Evaluation Routes
 *
 * 프론트엔드 E2E 테스트(M07 상호평가 모듈)를 위한 /api/evaluations 엔드포인트
 *
 * 기존 /api/reviews 와 병행 사용 가능 (동일 데이터, 다른 필드명)
 *
 * API 엔드포인트:
 * - POST   /api/evaluations          - 평가 생성
 * - GET    /api/evaluations/given    - 내가 한 평가 조회
 * - GET    /api/evaluations/received - 내가 받은 평가 조회
 * - GET    /api/evaluations/pending  - 미완료 평가 조회
 */

const express = require("express");
const router = express.Router();
const evaluationController = require("../controllers/evaluationController");
const authMiddleware = require("../middlewares/authMiddleware");

// POST /api/evaluations - 평가 생성
router.post("/", authMiddleware, evaluationController.createEvaluation);

// GET /api/evaluations/given?projectId=xxx - 내가 한 평가 조회
router.get("/given", authMiddleware, evaluationController.getGivenEvaluations);

// GET /api/evaluations/received - 내가 받은 평가 조회
router.get(
  "/received",
  authMiddleware,
  evaluationController.getReceivedEvaluations
);

// GET /api/evaluations/pending - 미완료 평가 목록 조회
router.get(
  "/pending",
  authMiddleware,
  evaluationController.getPendingEvaluations
);

module.exports = router;
