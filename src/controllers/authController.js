// src/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User, EmailVerification } = require("../models");
const { validatePassword } = require("../utils/passwordValidator");
const { generateUniqueUsername } = require("../utils/usernameGenerator");
const { v4: uuidv4 } = require("uuid"); // ✅ UUID 생성 모듈 추가
const { jwtSecret, jwtIssuer } = require("../config/authConfig");
const { verifyGoogleIdToken } = require("../utils/googleTokenVerifier");
const { parseResidentNumber, formatPhoneNumber } = require("../utils/registrationUtils");
const smsService = require("../services/smsService");

const EMAIL_VERIFICATION_GRACE_MS = 15 * 60 * 1000;

const hasRecentEmailVerification = async (email) => {
  const recentThreshold = new Date(Date.now() - EMAIL_VERIFICATION_GRACE_MS);
  const verification = await EmailVerification.findOne({
    where: {
      email,
      purpose: "signup",
      consumed_at: {
        [Op.gte]: recentThreshold,
      },
    },
    order: [["consumed_at", "DESC"]],
  });

  return !!verification;
};

exports.register = async (req, res) => {
  try {
    const {
      // 이메일 (둘 다 허용)
      email,
      schoolEmail,
      // 필수 필드
      password,
      // 새로운 필드
      name,
      phoneNumber,
      residentNumber,
      marketingAgreed,
      thirdPartyAgreed,
      // 기존 필드 (호환성 유지)
      university,
      department,
      student_id,
    } = req.body;

    // email 또는 schoolEmail 둘 다 허용
    const userEmail = email || schoolEmail;

    // 필수 값 검증
    if (!userEmail || !password) {
      return res.status(400).json({ error: "❌ 이메일과 비밀번호를 입력해주세요." });
    }

    // 주민번호 파싱 (생년월일 + 성별)
    let birthDate = null;
    let gender = null;
    if (residentNumber) {
      const parsed = parseResidentNumber(residentNumber);
      birthDate = parsed.birthDate;
      gender = parsed.gender;
    }

    // 전화번호 정규화
    const normalizedPhone = phoneNumber ? smsService.normalizePhone(phoneNumber) : null;
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (phoneNumber && !formattedPhone) {
      return res.status(400).json({ error: "❌ 올바른 전화번호 형식이 아닙니다." });
    }

    const serverSmsVerified = normalizedPhone ? smsService.hasVerifiedPhone(normalizedPhone) : false;
    const serverEmailVerified = await hasRecentEmailVerification(userEmail);

    if (!serverSmsVerified && !serverEmailVerified) {
      return res.status(400).json({
        error: "❌ 서버에서 확인된 SMS 인증 또는 이메일 인증을 완료해주세요.",
      });
    }

    // 자동 username 생성
    const username = await generateUniqueUsername(userEmail);
    // 비밀번호 유효성 검사
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // 중복 이메일 체크
    const existingUser = await User.findOne({ where: { email: userEmail } });
    if (existingUser) {
      return res.status(400).json({ error: "❌ 이미 존재하는 이메일입니다." });
    }

    // 중복 전화번호 체크 (전화번호가 있는 경우)
    if (formattedPhone) {
      const existingPhone = await User.findOne({ where: { phone_number: formattedPhone } });
      if (existingPhone) {
        return res.status(400).json({ error: "❌ 이미 등록된 전화번호입니다." });
      }
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새 유저 생성
    const newUser = await User.create({
      uuid: uuidv4(),
      username,
      email: userEmail,
      password: hashedPassword,
      role: "MEMBER",
      // 새로운 필드
      name: name || null,
      phone_number: formattedPhone,
      phone_verified: serverSmsVerified,
      phone_verified_at: serverSmsVerified ? new Date() : null,
      birth_date: birthDate,
      gender: gender,
      marketing_agreed: !!marketingAgreed,
      third_party_agreed: !!thirdPartyAgreed,
      // 기존 필드
      university: university || null,
      department: department || null,
      email_verified_at: serverEmailVerified ? new Date() : null,
    });

    if (serverSmsVerified && normalizedPhone) {
      smsService.consumeVerifiedPhone(normalizedPhone);
    }

    // JWT 토큰 발급 (자동 로그인용)
    const token = jwt.sign(
      {
        userId: newUser.user_id,
        email: newUser.email,
        role: newUser.role || 'user'
      },
      jwtSecret,
      { expiresIn: "1d", issuer: jwtIssuer }
    );

    // 보안 강화를 위해 HttpOnly 쿠키 옵션 추가
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return res.status(201).json({
      message: "✅ 회원가입 성공!",
      token: token,
      user: {
        user_id: newUser.user_id,
        uuid: newUser.uuid,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        birth_date: newUser.birth_date,
        gender: newUser.gender,
        phone_number: newUser.phone_number,
        createdAt: newUser.createdAt,
      },
      info: {
        generatedUsername: true,
        university: university || null,
        department: department || null,
        student_id: student_id || null,
        smsVerified: serverSmsVerified,
        emailVerified: serverEmailVerified,
      },
    });
  } catch (error) {
    console.error("🚨 회원가입 오류:", error);
    console.error("🚨 오류 상세:", error.message);
    console.error("🚨 오류 스택:", error.stack);
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
      return res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    // 3️⃣ 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    // 4️⃣ JWT 토큰 발급
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role }, // 역할 포함
      jwtSecret,
      { expiresIn: "1d", issuer: jwtIssuer }
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
      { expiresIn: process.env.APP_JWT_EXPIRES_IN || "1d", issuer: jwtIssuer }
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
        'name',
        'birth_date',
        'gender',
        'phone_number',
        'phone_verified',
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
        'mbti_type',
        'marketing_agreed',
        'third_party_agreed',
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
        name: user.name,
        birthDate: user.birth_date,
        gender: user.gender,
        phoneNumber: user.phone_number,
        phoneVerified: user.phone_verified,
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
        mbtiType: user.mbti_type,
        marketingAgreed: user.marketing_agreed,
        thirdPartyAgreed: user.third_party_agreed,
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
