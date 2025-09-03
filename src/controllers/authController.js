// src/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { validatePassword } = require("../utils/passwordValidator");
const { generateUniqueUsername } = require("../utils/usernameGenerator");
const { v4: uuidv4 } = require("uuid"); // ✅ UUID 생성 모듈 추가
const { jwtSecret } = require("../config/authConfig");
const { verifyGoogleIdToken } = require("../utils/googleTokenVerifier");

exports.register = async (req, res) => {
  try {
    const { email, password, university, department, student_id } = req.body;

    // 필수 값 검증 (username 제거, 프론트엔드 필드 추가)
    if (!email || !password) {
      return res.status(400).json({ error: "❌ 이메일과 비밀번호를 입력해주세요." });
    }

    console.log(`📝 Registration request for email: ${email}`);
    console.log(`📊 Additional data - University: ${university}, Department: ${department}, Student ID: ${student_id}`);

    // 자동 username 생성
    const username = await generateUniqueUsername(email);
    console.log(`✅ Generated username: ${username} for email: ${email}`);

    // 비밀번호 유효성 검사 추가
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.message });
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
      uuid: uuidv4(),
      username,
      email,
      password: hashedPassword,
      role: "MEMBER",
    });

    return res.status(201).json({
      message: "✅ 회원가입 성공!",
      user: {
        user_id: newUser.user_id,
        uuid: newUser.uuid,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
      info: {
        generatedUsername: true,
        university: university || null,
        department: department || null,
        student_id: student_id || null,
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
      jwtSecret,
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

// Google Social Login by ID Token
exports.googleSignInByIdToken = async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) return res.status(400).json({ error: "idToken is required" });

    const expectedAud = process.env.GOOGLE_OAUTH_CLIENT_ID;
    if (!expectedAud) return res.status(500).json({ error: "server not configured (GOOGLE_OAUTH_CLIENT_ID missing)" });

    const payload = await verifyGoogleIdToken(idToken, expectedAud);
    const email = payload.email;
    if (!email) return res.status(400).json({ error: "email not found in token" });

    // find or create user
    let user = await User.findOne({ where: { email } });
    if (!user) {
      const hashedPassword = await bcrypt.hash(uuidv4(), 10); // placeholder
      user = await User.create({
        uuid: uuidv4(),
        username: payload.name || email.split("@")[0],
        email,
        password: hashedPassword,
        role: "MEMBER",
        email_verified_at: payload.email_verified ? new Date() : null,
      });
    } else if (payload.email_verified && !user.email_verified_at) {
      await User.update({ email_verified_at: new Date() }, { where: { user_id: user.user_id } });
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: process.env.APP_JWT_EXPIRES_IN || "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return res.status(200).json({ message: "Google login success", token });
  } catch (err) {
    console.error("🚨 Google login error:", err?.message || err);
    return res.status(401).json({ error: "invalid google token" });
  }
};
