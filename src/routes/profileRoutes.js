// routes/profileRoutes.js

const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const authMiddleware = require("../middlewares/authMiddleware");

// 🔄 Get Profile by User ID
router.get("/:user_id", profileController.getProfileByUserId);

// ✅ ➕ Create New Profile
router.post("/", authMiddleware, profileController.createProfile);

// ✅ ✏️ Update Profile
router.put("/:profile_id", authMiddleware, profileController.updateProfile);

// ✅ 🗑️ Delete Profile
router.delete("/:profile_id", authMiddleware, profileController.deleteProfile);

// ✅ 📄 Get Resume (프로젝트 포함)
router.get("/resume/:user_id", profileController.getResume);

module.exports = router;
