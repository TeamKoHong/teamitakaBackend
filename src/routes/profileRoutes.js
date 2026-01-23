const express = require("express");
const router = express.Router();
const ProfileController = require("../controllers/profileController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { validateUUID } = require("../middlewares/uuidValidationMiddleware");

// 내 프로필 조회/수정 (인증 필요) - :user_id 라우트보다 먼저 정의해야 함
router.get("/me", authenticateToken, ProfileController.getMyProfile);
router.put("/", authenticateToken, ProfileController.updateProfile);

// 프로필 상세 정보 조회 (인증 필요)
router.get("/detail", authenticateToken, ProfileController.getProfileDetail);

// 대학 인증 상태 조회 (인증 필요)
router.get("/verification", authenticateToken, ProfileController.getVerificationStatus);

// 다른 사용자 프로필 조회 (인증 필요)
router.get("/:user_id", authenticateToken, validateUUID('user_id'), ProfileController.getUserProfile);
router.get("/:user_id/ratings", authenticateToken, validateUUID('user_id'), ProfileController.getUserRatings);
router.get("/:user_id/projects", authenticateToken, validateUUID('user_id'), ProfileController.getUserProjects);

module.exports = router;
