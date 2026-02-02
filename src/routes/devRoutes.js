const express = require("express");
const router = express.Router();
const devController = require("../controllers/devController");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/authConfig");
const { User } = require("../models");

router.delete("/clear-verified-emails", devController.clearVerifiedEmails);

// 테스트용 토큰 생성 엔드포인트 (개발 환경에서만 사용)
router.post("/test-token", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    // 사용자 조회
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: {
        userId: user.user_id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Test token generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// [REMOVED] SendGrid 테스트 엔드포인트 - 학교 이메일 인증이 Supabase OTP로 전환됨

module.exports = router;
