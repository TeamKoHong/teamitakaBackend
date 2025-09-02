const crypto = require('crypto');
const { createTransporter, getFromEmail, sendEmailWithSendGrid } = require('../config/emailConfig');
const { generateVerificationEmail, generateVerificationEmailText } = require('../templates/verificationEmail');
const { EmailVerification, User } = require('../models');
const { Op } = require('sequelize');

class VerificationService {
  constructor() {
    this.EXPIRATION_TIME = 3 * 60 * 1000; // 3분
    this.MAX_ATTEMPTS = 5;
    this.CODE_LENGTH = 6;
  }

  // 6자리 인증번호 생성
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // 이메일 형식 검증
  validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 대학교 이메일 도메인 검증 (선택사항)
  validateUniversityDomain(email) {
    const domain = email.split('@')[1];
    // 주요 대학교 도메인 목록 (필요시 확장)
    const universityDomains = [
      'korea.ac.kr', 'g.hongik.ac.kr', 'snu.ac.kr', 'yonsei.ac.kr',
      'kaist.ac.kr', 'postech.ac.kr', 'skku.edu', 'hanyang.ac.kr'
    ];
    return universityDomains.includes(domain);
  }

  // 중복 이메일 확인
  async checkDuplicateEmail(email) {
    try {
      const existingUser = await User.findOne({
        where: { email: email }
      });
      return !!existingUser;
    } catch (error) {
      console.error('중복 이메일 확인 중 오류:', error);
      throw new Error('이메일 중복 확인 중 오류가 발생했습니다.');
    }
  }

  // 이전 인증번호 무효화
  async invalidatePreviousCodes(email) {
    try {
      await EmailVerification.update(
        { consumed_at: new Date() },
        {
          where: {
            email: email,
            consumed_at: null,
            expires_at: { [Op.gt]: new Date() }
          }
        }
      );
    } catch (error) {
      console.error('이전 인증번호 무효화 중 오류:', error);
      // 오류가 발생해도 계속 진행
    }
  }

  // 인증번호 저장
  async saveVerification(email, code, ip, userAgent) {
    try {
      console.log(`[SERVICE] 인증번호 저장 시작: ${email}`);
      
      const expiresAt = new Date(Date.now() + this.EXPIRATION_TIME);
      console.log(`[SERVICE] 만료 시간 설정: ${expiresAt.toISOString()}`);
      
      const verificationData = {
        email: email,
        purpose: 'signup',
        jti: crypto.randomUUID(),
        code_hash: this.hashCode(code),
        expires_at: expiresAt,
        created_ip: ip,
        ua: userAgent,
        attempt_count: 0
      };
      
      console.log(`[SERVICE] 저장할 데이터 준비 완료: ${email}`);
      
      const result = await EmailVerification.create(verificationData);
      console.log(`[SERVICE] 인증번호 저장 성공: ${email}, ID: ${result.id}`);

      return true;
    } catch (error) {
      console.error(`[SERVICE] 인증번호 저장 중 오류: ${email}`);
      console.error(`[SERVICE] 오류 상세:`, error);
      console.error(`[SERVICE] 오류 스택:`, error.stack);
      console.error(`[SERVICE] 데이터베이스 연결 상태 확인 필요`);
      throw new Error('인증번호 저장 중 오류가 발생했습니다.');
    }
  }

  // 인증번호 해시화
  hashCode(code) {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  // 이메일 발송
  async sendVerificationEmail(email, code) {
    try {
      console.log(`[SERVICE] 이메일 발송 시작: ${email}`);
      
      const fromEmail = getFromEmail();
      console.log(`[SERVICE] 발신자 이메일: ${fromEmail}`);
      
      const mailOptions = {
        from: fromEmail,
        to: email,
        subject: 'TEAMITAKA 이메일 인증번호',
        html: generateVerificationEmail(code, email),
        text: generateVerificationEmailText(code)
      };

      console.log(`[SERVICE] 이메일 옵션 준비 완료: ${email}`);

      // SendGrid를 우선 사용하고, 실패 시 Nodemailer로 폴백
      try {
        console.log(`[SERVICE] SendGrid로 이메일 발송 시도: ${email}`);
        const result = await sendEmailWithSendGrid(mailOptions);
        console.log(`[SERVICE] SendGrid로 인증번호 이메일 발송 성공: ${email}, Message ID: ${result.messageId || 'N/A'}`);
        return result;
      } catch (sendgridError) {
        console.warn(`[SERVICE] SendGrid 실패, Nodemailer로 폴백: ${email}`, sendgridError.message);
        console.warn(`[SERVICE] SendGrid 오류 상세:`, sendgridError);
        
        // Nodemailer로 폴백
        console.log(`[SERVICE] Nodemailer로 이메일 발송 시도: ${email}`);
        const transporter = createTransporter();
        const result = await transporter.sendMail(mailOptions);
        console.log(`[SERVICE] Nodemailer로 인증번호 이메일 발송 성공: ${email}, Message ID: ${result.messageId || 'N/A'}`);
        return result;
      }
    } catch (error) {
      console.error(`[SERVICE] 이메일 발송 중 오류: ${email}`);
      console.error(`[SERVICE] 오류 상세:`, error);
      console.error(`[SERVICE] 오류 스택:`, error.stack);
      console.error(`[SERVICE] 환경 변수 확인: SENDGRID_API_KEY=${process.env.SENDGRID_API_KEY ? 'SET' : 'NOT_SET'}, EMAIL_USER=${process.env.EMAIL_USER || 'NOT_SET'}`);
      throw new Error('이메일 발송에 실패했습니다.');
    }
  }

  // 인증번호 검증
  async verifyCode(email, code) {
    try {
      const verification = await EmailVerification.findOne({
        where: {
          email: email,
          code_hash: this.hashCode(code),
          consumed_at: null,
          expires_at: { [Op.gt]: new Date() }
        },
        order: [['createdAt', 'DESC']]
      });

      if (!verification) {
        return { valid: false, message: '유효하지 않은 인증번호입니다.' };
      }

      // 시도 횟수 확인
      if (verification.attempt_count >= this.MAX_ATTEMPTS) {
        return { valid: false, message: '최대 시도 횟수를 초과했습니다.' };
      }

      // 시도 횟수 증가
      await verification.increment('attempt_count');

      // 인증 성공 시 사용 완료 처리
      if (verification.attempt_count <= this.MAX_ATTEMPTS) {
        await verification.update({ consumed_at: new Date() });
        return { valid: true, message: '인증이 완료되었습니다.' };
      }

      return { valid: false, message: '인증에 실패했습니다.' };
    } catch (error) {
      console.error('인증번호 검증 중 오류:', error);
      throw new Error('인증번호 검증 중 오류가 발생했습니다.');
    }
  }

  // 만료된 인증번호 정리 (크론 작업용)
  async cleanupExpiredCodes() {
    try {
      const result = await EmailVerification.update(
        { consumed_at: new Date() },
        {
          where: {
            expires_at: { [Op.lt]: new Date() },
            consumed_at: null
          }
        }
      );
      
      console.log(`만료된 인증번호 ${result[0]}개 정리 완료`);
      return result[0];
    } catch (error) {
      console.error('만료된 인증번호 정리 중 오류:', error);
      return 0;
    }
  }

  // 인증 상태 확인
  async getVerificationStatus(email) {
    try {
      const verification = await EmailVerification.findOne({
        where: {
          email: email,
          consumed_at: null,
          expires_at: { [Op.gt]: new Date() }
        },
        order: [['createdAt', 'DESC']]
      });

      if (!verification) {
        return { hasActiveCode: false, remainingTime: 0 };
      }

      const remainingTime = Math.max(0, verification.expires_at.getTime() - Date.now());
      return {
        hasActiveCode: true,
        remainingTime: Math.ceil(remainingTime / 1000), // 초 단위
        attemptCount: verification.attempt_count
      };
    } catch (error) {
      console.error('인증 상태 확인 중 오류:', error);
      return { hasActiveCode: false, remainingTime: 0 };
    }
  }
}

module.exports = new VerificationService();
