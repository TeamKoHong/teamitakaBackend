const { SolapiMessageService } = require('solapi');
const NodeCache = require('node-cache');
const { randomUUID } = require('crypto');

class SmsService {
  constructor() {
    this.EXPIRATION_TIME = 3 * 60; // 3분 (초 단위)
    this.MAX_ATTEMPTS = 5;
    this.CODE_LENGTH = 4;

    // 환경변수 검증
    if (!process.env.SOLAPI_API_KEY || !process.env.SOLAPI_API_SECRET) {
      console.error('[SmsService] ⚠️ SOLAPI_API_KEY 또는 SOLAPI_API_SECRET이 설정되지 않았습니다.');
    }
    if (!process.env.SOLAPI_SENDER_NUM) {
      console.error('[SmsService] ⚠️ SOLAPI_SENDER_NUM이 설정되지 않았습니다.');
    }

    // Solapi 초기화
    this.messageService = new SolapiMessageService(
      process.env.SOLAPI_API_KEY,
      process.env.SOLAPI_API_SECRET
    );

    // NodeCache 초기화 (3분 TTL)
    this.smsCache = new NodeCache({
      stdTTL: this.EXPIRATION_TIME,
      checkperiod: 60 // 60초마다 만료된 키 정리
    });

    console.log('[SmsService] 서비스 초기화 완료');
  }

  /**
   * 4자리 인증번호 생성
   * @returns {string} 4자리 숫자 문자열
   */
  generateVerificationCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * 세션 ID 생성
   * @returns {string} UUID v4
   */
  generateSessionId() {
    return randomUUID();
  }

  /**
   * 한국 휴대폰 번호 형식 검증
   * @param {string} phone - 전화번호
   * @returns {boolean}
   */
  validatePhoneFormat(phone) {
    const phoneRegex = /^01[016789][0-9]{7,8}$/;
    return phoneRegex.test(phone);
  }

  /**
   * 전화번호 정규화 (하이픈, 공백 제거)
   * @param {string} phone - 전화번호
   * @returns {string}
   */
  normalizePhone(phone) {
    return phone.replace(/[-\s]/g, '');
  }

  /**
   * 인증번호 저장 (sessionId 기반)
   * @param {string} sessionId - 세션 ID
   * @param {string} phone - 전화번호
   * @param {string} code - 인증번호
   * @returns {boolean}
   */
  saveVerification(sessionId, phone, code) {
    const cacheKey = `sms:${sessionId}`;
    const data = {
      phone: phone,
      code: code,
      attemptCount: 0,
      createdAt: Date.now()
    };
    this.smsCache.set(cacheKey, data);
    return true;
  }

  /**
   * 이전 인증번호 무효화
   * @param {string} phone - 전화번호
   */
  invalidatePreviousCode(phone) {
    const cacheKey = `sms:${phone}`;
    this.smsCache.del(cacheKey);
  }

  /**
   * Solapi를 통해 SMS 발송
   * @param {string} phone - 수신자 전화번호
   * @param {string} code - 인증번호
   * @returns {Promise<{messageId: string}>}
   */
  async sendSms(phone, code) {
    try {
      const result = await this.messageService.sendOne({
        to: phone,
        from: process.env.SOLAPI_SENDER_NUM,
        text: `[티미타카] 인증번호는 [${code}]입니다. 3분 내에 입력해주세요.`
      });

      console.log(`[SMS] 발송 성공: ${phone}, messageId: ${result.messageId}`);
      return { messageId: result.messageId };
    } catch (error) {
      console.error(`[SMS] 발송 실패: ${phone}`, error.message);
      throw new Error('SMS 발송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  /**
   * 인증번호 검증 (sessionId 기반)
   * @param {string} sessionId - 세션 ID
   * @param {string} code - 입력된 인증번호
   * @returns {{valid: boolean, phone: string|null, message: string}}
   */
  verifyCode(sessionId, code) {
    const cacheKey = `sms:${sessionId}`;
    const cached = this.smsCache.get(cacheKey);

    // 캐시에 데이터가 없는 경우 (만료 또는 미발송)
    if (!cached) {
      return {
        valid: false,
        phone: null,
        message: '인증번호가 만료되었거나 존재하지 않습니다. 다시 요청해주세요.'
      };
    }

    // 최대 시도 횟수 초과
    if (cached.attemptCount >= this.MAX_ATTEMPTS) {
      this.smsCache.del(cacheKey);
      return {
        valid: false,
        phone: cached.phone,
        message: '최대 시도 횟수(5회)를 초과했습니다. 인증번호를 다시 요청해주세요.'
      };
    }

    // 시도 횟수 증가
    cached.attemptCount++;
    this.smsCache.set(cacheKey, cached);

    // 코드 불일치
    if (cached.code !== code) {
      const remainingAttempts = this.MAX_ATTEMPTS - cached.attemptCount;
      return {
        valid: false,
        phone: cached.phone,
        message: `인증번호가 일치하지 않습니다. (남은 시도: ${remainingAttempts}회)`
      };
    }

    // 인증 성공 - 코드 삭제 (재사용 방지)
    this.smsCache.del(cacheKey);
    return {
      valid: true,
      phone: cached.phone,
      message: '인증이 완료되었습니다.'
    };
  }

  /**
   * 인증 상태 확인
   * @param {string} phone - 전화번호
   * @returns {{hasActiveCode: boolean, remainingTime: number, attemptCount: number}}
   */
  getVerificationStatus(phone) {
    const cacheKey = `sms:${phone}`;
    const cached = this.smsCache.get(cacheKey);

    if (!cached) {
      return {
        hasActiveCode: false,
        remainingTime: 0,
        attemptCount: 0
      };
    }

    const ttl = this.smsCache.getTtl(cacheKey);
    const remainingTime = Math.max(0, Math.ceil((ttl - Date.now()) / 1000));

    return {
      hasActiveCode: true,
      remainingTime: remainingTime,
      attemptCount: cached.attemptCount
    };
  }
}

// 싱글톤 인스턴스 export
module.exports = new SmsService();
