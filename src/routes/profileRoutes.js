const express = require("express");
const router = express.Router();
const ProfileController = require("../controllers/profileController");
const { authenticateToken } = require("../middlewares/authMiddleware");

// 내 프로필 조회/수정 (인증 필요) - :user_id 라우트보다 먼저 정의해야 함
router.get("/me", authenticateToken, ProfileController.getMyProfile);
router.put("/", authenticateToken, ProfileController.updateProfile);

// 다른 사용자 프로필 조회 (인증 필요)
router.get("/:user_id", authenticateToken, ProfileController.getUserProfile);
router.get("/:user_id/ratings", authenticateToken, ProfileController.getUserRatings);
router.get("/:user_id/projects", authenticateToken, ProfileController.getUserProjects);

module.exports = router;
