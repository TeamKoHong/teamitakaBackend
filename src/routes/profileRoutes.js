const express = require("express");
const router = express.Router();
const { Profile, User, Project } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");

// 🔄 Get Profile by User ID (프로필만 조회)
router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const profile = await Profile.findOne({
      where: { user_id },
      include: [{ model: User, attributes: ["email", "username"] }],
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "프로필을 찾을 수 없습니다." });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    res.status(500).json({ success: false, message: "서버 에러" });
  }
});

// ✅ ➕ Create New Profile
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

    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    console.error("❌ Error creating profile:", error);
    res.status(500).json({ success: false, message: "프로필 생성 실패" });
  }
});

// ✅ ✏️ Update Profile
router.put("/:profile_id", authMiddleware, async (req, res) => {
  try {
    const { profile_id } = req.params;
    const updates = req.body;

    const profile = await Profile.findByPk(profile_id);

    if (!profile) {
      return res.status(404).json({ success: false, message: "프로필을 찾을 수 없습니다." });
    }

    await profile.update(updates);
    res.json({ success: true, message: "프로필이 수정되었습니다.", data: profile });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({ success: false, message: "프로필 수정 실패" });
  }
});

// ✅ 🗑️ Delete Profile
router.delete("/:profile_id", authMiddleware, async (req, res) => {
  try {
    const { profile_id } = req.params;

    const profile = await Profile.findByPk(profile_id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "프로필을 찾을 수 없습니다." });
    }

    await profile.destroy();
    res.json({ success: true, message: "프로필이 삭제되었습니다." });
  } catch (error) {
    console.error("❌ Error deleting profile:", error);
    res.status(500).json({ success: false, message: "프로필 삭제 실패" });
  }
});

// ✅ 📄 Get Resume (프로젝트 포함)
router.get("/resume/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    // ✅ 프로필 가져오기
    const profile = await Profile.findOne({
      where: { user_id },
      include: [{ model: User, attributes: ["email", "username"] }],
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "프로필을 찾을 수 없습니다." });
    }

    // ✅ 사용자의 프로젝트 가져오기
    const projects = await Project.findAll({
      where: { user_id },
      attributes: ["title", "description", "start_date", "end_date", "role", "status"],
      order: [["start_date", "DESC"]],
    });

    // ✅ 이력서 데이터 구성
    const resume = {
      profile: {
        nickname: profile.nickname,
        university: profile.university,
        major1: profile.major1,
        major2: profile.major2,
        skills: profile.skills,
        link: profile.link,
        awards: profile.awards,
        strengths: profile.strengths,
        weaknesses: profile.weaknesses,
        email: profile.User.email,
      },
      projects: projects || [], // 프로젝트가 없으면 빈 배열 반환
    };

    res.json({ success: true, data: resume });
  } catch (error) {
    console.error("❌ Error fetching resume:", error);
    res.status(500).json({ success: false, message: "이력서 조회 실패" });
  }
});

module.exports = router;
