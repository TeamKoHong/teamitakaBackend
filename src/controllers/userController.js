// src/controllers/userController.js
const { User } = require("../models"); // models/index.js에서 export한 db 객체 중 User 모델
const bcrypt = require("bcryptjs");

/**
 * GET /users
 * 사용자 목록 조회
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "user_id",
        "username",
        "email",
        "role",
        "name",
        "university",
        "major",
        "phone_verified",
        "email_verified_at",
        "createdAt",
        "created_at",
      ],
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error("getUsers Error:", error);
    return res.status(500).json({ error: "Failed to retrieve users" });
  }
};

/**
 * POST /users
 * 새 사용자 생성
 */
exports.createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email, password는 필수입니다." });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "이미 존재하는 이메일입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashedPassword });

    return res.status(201).json({
      user_id: newUser.user_id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    console.error("createUser Error:", error);
    return res.status(500).json({ error: "Failed to create user" });
  }
};

//탈퇴
exports.deleteUser = async (req, res) => {
  try {
    const user_id = req.params.id;

    // 인가 체크: 본인만 삭제 가능
    if (req.user.userId !== user_id) {
      return res.status(403).json({ error: "본인 계정만 삭제할 수 있습니다." });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }
    await user.destroy();
    return res.status(200).json({ message: "사용자가 삭제되었습니다." });
  } catch (error) {
    console.error("deleteUser Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * POST /user/type-result
 * MBTI 성향 테스트 결과 저장
 */
exports.updateMbtiType = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type } = req.body;

    if (!type) {
      return res.status(400).json({ success: false, message: "type is required" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }

    await user.update({ mbti_type: type });

    return res.status(200).json({ success: true, message: "Type updated" });
  } catch (error) {
    console.error("updateMbtiType Error:", error);
    return res.status(500).json({ success: false, message: "서버 오류 발생" });
  }
};
