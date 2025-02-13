const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "고려대학교 이메일 인증 코드",
    text: `당신의 인증 코드는 ${otp}입니다. 5분 내에 입력해주세요.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ 이메일 전송 완료: ${email}`);
  } catch (error) {
    console.error("❌ 이메일 전송 실패:", error);
  }
};

module.exports = { sendVerificationEmail };
