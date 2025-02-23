// routes/profileRoutes.js

const express = require("express");
const router = express.Router();
const { Profile, User } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");

// 🔄 Get Profile by User ID
router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const profile = await Profile.findOne({
      where: { user_id },
      include: [{ model: User, attributes: ["email"] }],
    });

    if (!profile) {
      return res.status(404).json({ message: "프로필을 찾을 수 없습니다." });
    }

    res.json(profile);
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    res.status(500).json({ message: "서버 에러" });
  }
});

// ➕ Create New Profile
router.post("/", authMiddleware, async (req, res) => {
  try {
    const user_id = res.locals.user.user_id;
    const {
      nickname,
      university,
      major1,
      major2,
      skills,
      link,
      awards,
      ability_graph,
      strengths,
      weaknesses,
    } = req.body;

    const profile = await Profile.create({
      user_id,
      nickname,
      university,
      major1,
      major2,
      skills,
      link,
      awards,
      ability_graph,
      strengths,
      weaknesses,
    });

    res.status(201).json(profile);
  } catch (error) {
    console.error("❌ Error creating profile:", error);
    res.status(500).json({ message: "프로필 생성 실패" });
  }
});

// ✏️ Update Profile
router.put("/:profile_id", authMiddleware, async (req, res) => {
  try {
    const { profile_id } = req.params;
    const updates = req.body;

    const profile = await Profile.findByPk(profile_id);

    if (!profile) {
      return res.status(404).json({ message: "프로필을 찾을 수 없습니다." });
    }

    await profile.update(updates);
    res.json({ message: "프로필이 수정되었습니다.", profile });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({ message: "프로필 수정 실패" });
  }
});

// 🗑️ Delete Profile
router.delete("/:profile_id", authMiddleware, async (req, res) => {
  try {
    const { profile_id } = req.params;

    const profile = await Profile.findByPk(profile_id);
    if (!profile) {
      return res.status(404).json({ message: "프로필을 찾을 수 없습니다." });
    }

    await profile.destroy();
    res.json({ message: "프로필이 삭제되었습니다." });
  } catch (error) {
    console.error("❌ Error deleting profile:", error);
    res.status(500).json({ message: "프로필 삭제 실패" });
  }
});

module.exports = router;
