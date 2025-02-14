// src/controllers/userController.js
const { User } = require("../models"); // models/index.js에서 export한 db 객체 중 User 모델

/**
 * GET /users
 * 사용자 목록 조회
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll(); // DB의 Users 테이블 전체 조회
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
    // 실제 로직: 비밀번호 해시, 중복검사 등
    const newUser = await User.create({ username, email, password });
    return res.status(201).json(newUser);
  } catch (error) {
    console.error("createUser Error:", error);
    return res.status(500).json({ error: "Failed to create user" });
  }
};
