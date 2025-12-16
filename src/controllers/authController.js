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
    const { email, password, university, department, student_id, isEmailVerified } = req.body;

    // 필수 값 검증 (username 제거, 프론트엔드 필드 추가)
    if (!email || !password) {
      return res.status(400).json({ error: "❌ 이메일과 비밀번호를 입력해주세요." });
    }

    // 이메일 인증 상태 검증
    if (!isEmailVerified) {
      return res.status(400).json({ error: "❌ 이메일 인증을 완료해주세요." });
    }

    console.log(`📝 Registration request for email: ${email}`);
    console.log(`📊 Additional data - University: ${university}, Department: ${department}, Student ID: ${student_id}`);
    console.log(`📧 Email verification status: ${isEmailVerified}`);

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

    // 4️⃣ JWT 토큰 발급 (자동 로그인용)
    const token = jwt.sign(
      { 
        userId: newUser.user_id, 
        email: newUser.email, 
        role: newUser.role || 'user' 
      },
      jwtSecret,
      { expiresIn: "1d" }
    );

    // 5️⃣ 보안 강화를 위해 HttpOnly 쿠키 옵션 추가
    res.cookie("token", token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return res.status(201).json({
      message: "✅ 회원가입 성공!",
      token: token, // JWT 토큰 추가
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
    console.error("🚨 오류 상세:", error.message);
    console.error("🚨 오류 스택:", error.stack);
    console.error("🚨 요청 데이터:", req.body);
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

    // 6️⃣ 응답 형식: 프론트엔드 요청에 따라 user 객체 포함
    return res.status(200).json({
      success: true,
      message: "로그인 성공",
      token,
      user: {
        userId: user.user_id,
        email: user.email,
        username: user.username,
        role: user.role,
        university: user.university,
        major: user.major,
        avatar: user.avatar,
        bio: user.bio
      }
    });
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

// GET /api/auth/me - 현재 로그인한 사용자 정보 조회
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId; // authMiddleware에서 설정됨

    const user = await User.findByPk(userId, {
      attributes: [
        'user_id',
        'username',
        'email',
        'role',
        'university',
        'major',
        'avatar',
        'bio',
        'awards',
        'skills',
        'portfolio_url',
        'email_verified_at',
        'department',
        'enrollment_status',
        'team_experience',
        'keywords',
        'created_at',
        'updated_at'
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다."
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        university: user.university,
        major: user.major,
        avatar: user.avatar,
        profileImage: user.avatar, // 프론트엔드 요청 필드명
        bio: user.bio,
        awards: user.awards,
        skills: user.skills,
        portfolioUrl: user.portfolio_url,
        emailVerifiedAt: user.email_verified_at,
        department: user.department,
        enrollmentStatus: user.enrollment_status,
        teamExperience: user.team_experience,
        keywords: user.keywords || [],
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
  } catch (error) {
    console.error("🚨 getCurrentUser Error:", error);
    return res.status(500).json({
      success: false,
      message: "사용자 정보 조회 실패",
      error: error.message
    });
  }
};

// POST /api/auth/phone/verify - Firebase 전화번호 인증
exports.verifyPhone = async (req, res) => {
  try {
    const { idToken } = req.body;

    // 1️⃣ 필수 값 검증
    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: "❌ Firebase ID Token이 필요합니다."
      });
    }

    console.log("📱 전화번호 인증 요청 수신");

    // 2️⃣ Phone Auth Service를 통한 인증 처리
    const { verifyPhoneAndAuthenticate } = require("../services/phoneAuthService");
    const result = await verifyPhoneAndAuthenticate(idToken);

    // 3️⃣ JWT 토큰을 HttpOnly 쿠키로 설정
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    // 4️⃣ 성공 응답
    return res.status(200).json({
      success: true,
      message: result.isNewUser ? "✅ 회원가입 및 로그인 성공!" : "✅ 로그인 성공!",
      token: result.token,
      user: result.user,
      isNewUser: result.isNewUser
    });
  } catch (error) {
    console.error("🚨 전화번호 인증 오류:", error);
    return res.status(401).json({
      success: false,
      error: "전화번호 인증에 실패했습니다.",
      details: error.message
    });
  }
};
