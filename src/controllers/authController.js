// src/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { validatePassword } = require("../utils/passwordValidator");
const { v4: uuidv4 } = require("uuid"); // ✅ UUID 생성 모듈 추가

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 필수 값 검증
    if (!username || !email || !password) {
      return res.status(400).json({ error: "❌ 모든 필드를 입력해주세요." });
    }

    // 중복 이메일 체크
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "❌ 이미 존재하는 이메일입니다." });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새 유저 생성 (uuid 추가)
    const newUser = await User.create({
      uuid: uuidv4(), // ✅ UUID 생성
      username,
      email,
      password: hashedPassword,
      role: "MEMBER",
    });

    return res.status(201).json({
      message: "✅ 회원가입 성공!",
      user: {
        user_id: newUser.user_id, // ✅ 자동 증가 값
        uuid: newUser.uuid, // ✅ UUID 포함
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("🚨 회원가입 오류:", error);
    return res.status(500).json({ error: "서버 오류 발생" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ 필수 값 검증
    if (!email || !password) {
      return res.status(400).json({ error: "이메일과 비밀번호를 입력해야 합니다." });
    }

    // 2️⃣ 사용자 조회
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "존재하지 않는 이메일입니다." });
    }

    // 3️⃣ 비밀번호 확인
    console.log("요청된 이메일:", email);
    console.log("요청된 비밀번호:", password);
    console.log("DB 비밀번호 해시:", user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("비교 결과:", isMatch); // ← false로 찍히면 해시 문제
    if (!isMatch) {
      return res.status(401).json({ error: "비밀번호가 일치하지 않습니다." });
    }

    // 4️⃣ JWT 토큰 발급
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role }, // 역할 포함
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 5️⃣ 보안 강화를 위해 HttpOnly 쿠키 옵션 추가 가능
    res.cookie("token", token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return res.status(200).json({ message: "✅ 로그인 성공!", token });
  } catch (error) {
    console.error("🚨 로그인 오류:", error);
    return res.status(500).json({ error: "서버 오류 발생" });
  }
};

exports.validatePassword = (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "비밀번호를 입력해주세요." });
  }

  const validationResult = validatePassword(password);
  return res.json(validationResult);
};
