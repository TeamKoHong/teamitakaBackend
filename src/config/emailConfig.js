const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

// SendGrid API 키 설정 (레거시 - 체험판 만료)
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Resend 클라이언트 초기화
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

// Resend를 사용한 이메일 전송 (권장)
const sendEmailWithResend = async (mailOptions) => {
  try {
    if (!resend) {
      throw new Error('RESEND_API_KEY가 설정되지 않았습니다.');
    }

    const { data, error } = await resend.emails.send({
      from: mailOptions.from || process.env.EMAIL_FROM || 'TeamItaka <onboarding@resend.dev>',
      to: [mailOptions.to],
      subject: mailOptions.subject,
      html: mailOptions.html,
      text: mailOptions.text
    });

    if (error) {
      console.error('Resend 이메일 전송 실패:', error);
      throw new Error(error.message);
    }

    console.log('Resend 이메일 전송 성공:', data);
    return data;
  } catch (error) {
    console.error('Resend 이메일 전송 실패:', error);
    throw error;
  }
};

// SendGrid를 사용한 이메일 전송 (레거시 - 체험판 만료)
const sendEmailWithSendGrid = async (mailOptions) => {
  try {
    const msg = {
      to: mailOptions.to,
      from: mailOptions.from || getFromEmail(),
      subject: mailOptions.subject,
      text: mailOptions.text,
      html: mailOptions.html
    };

    // 배너 이미지 첨부 (첨부파일과 인라인 이미지로 사용)
    if (mailOptions.attachments) {
      msg.attachments = mailOptions.attachments;
    } else {
      // 기본 배너 이미지 첨부
      const bannerPath = path.join(__dirname, '../img/teamitaka_banner.png');
      if (fs.existsSync(bannerPath)) {
        const bannerContent = fs.readFileSync(bannerPath).toString('base64');
        msg.attachments = [
          {
            content: bannerContent,
            filename: 'teamitaka_banner.png',
            type: 'image/png',
            disposition: 'inline',
            content_id: 'banner'
          }
        ];
      }
    }

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
  sendEmailWithSendGrid,
  sendEmailWithResend
};
