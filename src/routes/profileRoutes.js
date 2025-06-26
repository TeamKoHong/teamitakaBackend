const express = require("express");
const router = express.Router();
const ProfileController = require("../controllers/profileController");
const { authenticateToken } = require("../middlewares/authMiddleware");

// 인증이 필요한 프로필 조회
router.get("/:user_id", authenticateToken, ProfileController.getUserProfile);
router.get("/:user_id/ratings", authenticateToken, ProfileController.getUserRatings);
router.get("/:user_id/projects", authenticateToken, ProfileController.getUserProjects);

module.exports = router;
