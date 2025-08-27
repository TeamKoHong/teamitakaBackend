const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

// SendGrid API 키 설정
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// 이메일 서비스 설정
const emailConfig = {
  // Gmail SMTP 설정
  gmail: {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD // Gmail 앱 비밀번호 사용
    }
  },
  
  // SendGrid 설정 (SMTP)
  sendgrid: {
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY
    }
  },
  
  // 기본 설정
  default: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  }
};

// 현재 환경에 맞는 설정 반환
const getEmailConfig = () => {
  const emailService = process.env.EMAIL_SERVICE || 'default';
  return emailConfig[emailService] || emailConfig.default;
};

// 이메일 전송기 생성
const createTransporter = () => {
  const config = getEmailConfig();
  return nodemailer.createTransport(config);
};

// SendGrid를 사용한 이메일 전송 (권장)
const sendEmailWithSendGrid = async (mailOptions) => {
  try {
    const msg = {
      to: mailOptions.to,
      from: mailOptions.from || getFromEmail(),
      subject: mailOptions.subject,
      text: mailOptions.text,
      html: mailOptions.html
    };
    
    const result = await sgMail.send(msg);
    return result;
  } catch (error) {
    console.error('SendGrid 이메일 전송 실패:', error);
    throw error;
  }
};

// 발신자 정보
const getFromEmail = () => {
  return process.env.EMAIL_FROM || 'noreply@teamitaka.com';
};

// 도메인 인증 확인
const isDomainAuthenticated = () => {
  const fromEmail = getFromEmail();
  return fromEmail.includes('teamitaka.com');
};

module.exports = {
  createTransporter,
  getFromEmail,
  getEmailConfig,
  isDomainAuthenticated,
  sendEmailWithSendGrid
};
