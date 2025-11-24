const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { verifyIdToken, getUserByUid } = require("../utils/firebaseAdmin");
const { jwtSecret } = require("../config/authConfig");
const { generateUniqueUsername } = require("../utils/usernameGenerator");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

/**
 * Firebase 전화번호 인증을 통한 로그인/회원가입
 * @param {string} idToken - Firebase ID Token (프론트엔드에서 전송)
 * @returns {Promise<{token: string, user: object, isNewUser: boolean}>}
 */
const verifyPhoneAndAuthenticate = async (idToken) => {
  try {
    // 1️⃣ Firebase ID Token 검증
    const decodedToken = await verifyIdToken(idToken);
    const { uid, phone_number } = decodedToken;

    if (!phone_number) {
      throw new Error("전화번호 정보를 찾을 수 없습니다.");
    }

    console.log(`📱 전화번호 인증 시도: ${phone_number}, Firebase UID: ${uid}`);

    // 2️⃣ Firebase UID로 기존 사용자 조회
    let user = await User.findOne({ where: { firebase_phone_uid: uid } });
    let isNewUser = false;

    if (!user) {
      // 3️⃣ 신규 사용자 생성
      console.log(`🆕 신규 사용자 생성: ${phone_number}`);

      // 이메일 대신 전화번호로 고유 username 생성
      const username = await generateUniqueUsername(phone_number);

      // 플레이스홀더 비밀번호 (전화번호 인증 사용자는 비밀번호 로그인 불가)
      const hashedPassword = await bcrypt.hash(uuidv4(), 10);

      user = await User.create({
        uuid: uuidv4(),
        username,
        email: `${uid}@phone.teamitaka.com`, // 임시 이메일 (전화번호 사용자용)
        password: hashedPassword,
        firebase_phone_uid: uid,
        phone_number,
        phone_verified: true,
        phone_verified_at: new Date(),
        role: "MEMBER",
      });

      isNewUser = true;
      console.log(`✅ 신규 사용자 생성 완료: ${user.user_id}`);
    } else {
      // 4️⃣ 기존 사용자 - 전화번호 인증 정보 업데이트
      console.log(`✅ 기존 사용자 로그인: ${user.user_id}`);

      await user.update({
        phone_number,
        phone_verified: true,
        phone_verified_at: new Date(),
      });
    }

    // 5️⃣ JWT 토큰 발급
    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: process.env.APP_JWT_EXPIRES_IN || "1d" }
    );

    console.log(`🔑 JWT 토큰 발급 완료: ${user.user_id}`);

    // 6️⃣ 응답 데이터 반환
    return {
      token,
      user: {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phone_number,
        phoneVerified: user.phone_verified,
        role: user.role,
        university: user.university,
        major: user.major,
        avatar: user.avatar,
        bio: user.bio,
      },
      isNewUser,
    };
  } catch (error) {
    console.error("❌ 전화번호 인증 실패:", error.message);
    throw error;
  }
};

/**
 * 사용자의 전화번호 인증 상태 확인
 * @param {string} userId - 사용자 ID
 * @returns {Promise<{verified: boolean, phoneNumber: string | null}>}
 */
const checkPhoneVerificationStatus = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: ["phone_verified", "phone_number", "phone_verified_at"],
    });

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    return {
      verified: user.phone_verified,
      phoneNumber: user.phone_number,
      verifiedAt: user.phone_verified_at,
    };
  } catch (error) {
    console.error("❌ 전화번호 인증 상태 확인 실패:", error.message);
    throw error;
  }
};

module.exports = {
  verifyPhoneAndAuthenticate,
  checkPhoneVerificationStatus,
};
