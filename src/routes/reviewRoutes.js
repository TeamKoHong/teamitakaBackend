const express = require("express");
const router = express.Router();
const ReviewController = require("../controllers/reviewController");
const authMiddleware = require("../middlewares/authMiddleware"); // 인증 미들웨어

router.post("/", authMiddleware, ReviewController.createReview);
router.get("/user/:user_id", authMiddleware, ReviewController.getUserReviews);
router.get("/project/:project_id/reviewer/:reviewer_id", authMiddleware, ReviewController.getReviewsByReviewer);
router.get("/project/:project_id/summary", authMiddleware, ReviewController.getProjectReviewSummary);
router.get("/project/:project_id", authMiddleware, ReviewController.getProjectReviews);
router.delete("/:review_id", authMiddleware, ReviewController.deleteReview);

module.exports = router;
