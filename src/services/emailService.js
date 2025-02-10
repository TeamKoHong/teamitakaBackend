const speakeasy = require("speakeasy");
const EmailVerification = require("../models/emailVerification");
const { sendVerificationEmail } = require("../config/email");

exports.sendOtp = async (email) => {
  // 고려대학교 이메일인지 확인
  if (!email.endsWith("@korea.ac.kr")) {
    throw new Error("고려대학교 이메일만 인증 가능합니다.");
  }

  const otp = speakeasy.totp({
    secret: process.env.OTP_SECRET || "mysecret",
    digits: 6,
    step: 300, // 5분 유효
  });

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5분 후 만료

  await EmailVerification.upsert({ email, otp, expiresAt });

  await sendVerificationEmail(email, otp);
  return { message: "인증 코드가 이메일로 전송되었습니다." };
};

exports.verifyOtp = async (email, otp) => {
  const record = await EmailVerification.findOne({ where: { email } });

  if (!record || record.expiresAt < new Date()) {
    throw new Error("인증 코드가 만료되었거나 잘못되었습니다.");
  }

  if (record.otp !== otp) {
    throw new Error("잘못된 인증 코드입니다.");
  }

  return { message: "이메일 인증 완료", verified: true };
};
