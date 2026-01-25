const express = require("express");
const router = express.Router();
const ReviewController = require("../controllers/reviewController");
const authMiddleware = require("../middlewares/authMiddleware"); // 인증 미들웨어
const { validateUUID } = require("../middlewares/uuidValidationMiddleware");

router.post("/", authMiddleware, ReviewController.createReview);
router.get("/user/:user_id", authMiddleware, validateUUID('user_id'), ReviewController.getUserReviews);
router.get("/project/:project_id/reviewer/:reviewer_id", authMiddleware, validateUUID('project_id', 'reviewer_id'), ReviewController.getReviewsByReviewer);
router.get("/project/:project_id/summary", authMiddleware, validateUUID('project_id'), ReviewController.getProjectReviewSummary);
router.get("/project/:project_id", authMiddleware, validateUUID('project_id'), ReviewController.getProjectReviews);
router.delete("/:review_id", authMiddleware, validateUUID('review_id'), ReviewController.deleteReview);

module.exports = router;
