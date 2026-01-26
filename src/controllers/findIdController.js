const smsService = require('../services/smsService');
const { User } = require('../models');
const { formatPhoneNumber } = require('../utils/registrationUtils');

// 상수 정의
const FIND_ID_CACHE_PREFIX = 'find-id';
const EXPIRATION_TIME = 180; // 3분 (초 단위)
const MAX_ATTEMPTS = 5;

/**
 * 이메일 마스킹 처리
 * @param {string} email - 원본 이메일
 * @returns {string} 마스킹된 이메일 (예: hong****@example.com)
 */
const maskEmail = (email) => {
  if (!email) return null;

  const [local, domain] = email.split('@');
  if (!local || !domain) return email;

  if (local.length <= 4) {
    // 4자 이하: 첫 글자만 표시 (예: a***@...)
    return local[0] + '***@' + domain;
  }

  // 5자 이상: 앞 4자리 표시 (예: hong****@...)
  return local.slice(0, 4) + '****@' + domain;
};

/**
 * 날짜 포맷팅 (YYYY.MM.DD)
 * @param {Date} date - 날짜 객체
 * @returns {string} 포맷된 날짜
 */
const formatJoinDate = (date) => {
  if (!date) return null;

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
};

/**
 * 아이디 찾기용 캐시 저장
 * @param {string} sessionId - 세션 ID
 * @param {string} phone - 전화번호
 * @param {string} code - 인증번호
 * @param {string} userId - 사용자 ID (검증 시 사용)
 */
const saveFindIdVerification = (sessionId, phone, code, userId) => {
  const cacheKey = `${FIND_ID_CACHE_PREFIX}:${sessionId}`;
  const data = {
    phone,
    code,
    userId,
    attemptCount: 0,
    createdAt: Date.now()
  };
  smsService.smsCache.set(cacheKey, data, EXPIRATION_TIME);
  return true;
};

/**
 * 아이디 찾기용 캐시 조회
 * @param {string} sessionId - 세션 ID
 * @returns {object|null}
 */
const getFindIdVerification = (sessionId) => {
  const cacheKey = `${FIND_ID_CACHE_PREFIX}:${sessionId}`;
  return smsService.smsCache.get(cacheKey);
};

/**
 * 아이디 찾기용 캐시 삭제
 * @param {string} sessionId - 세션 ID
 */
const deleteFindIdVerification = (sessionId) => {
  const cacheKey = `${FIND_ID_CACHE_PREFIX}:${sessionId}`;
  smsService.smsCache.del(cacheKey);
};

/**
 * 아이디 찾기용 캐시 업데이트
 * @param {string} sessionId - 세션 ID
 * @param {object} data - 업데이트할 데이터
 */
const updateFindIdVerification = (sessionId, data) => {
  const cacheKey = `${FIND_ID_CACHE_PREFIX}:${sessionId}`;
  const ttl = smsService.smsCache.getTtl(cacheKey);
  const remainingTtl = ttl ? Math.ceil((ttl - Date.now()) / 1000) : EXPIRATION_TIME;
  smsService.smsCache.set(cacheKey, data, remainingTtl);
};

/**
 * 아이디 찾기 SMS 인증번호 전송
 * POST /api/auth/find-id/send-sms
 */
exports.sendFindIdSms = async (req, res) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const { name, carrier, phone } = req.body;

  try {
    console.log(`[FindId] SMS 인증 요청 시작: name=${name}, phone=${phone}, carrier=${carrier}, IP=${clientIP}`);

    // 1. 전화번호 정규화
    const normalizedPhone = smsService.normalizePhone(phone);

    if (!smsService.validatePhoneFormat(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PHONE_FORMAT',
        message: '올바른 전화번호 형식이 아닙니다.'
      });
    }

    // 2. E.164 형식으로 변환
    const e164Phone = formatPhoneNumber(normalizedPhone);
    console.log(`[FindId] E.164 형식: ${e164Phone}`);

    if (!e164Phone) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PHONE_FORMAT',
        message: '전화번호를 E.164 형식으로 변환할 수 없습니다.'
      });
    }

    // 3. 사용자 조회 (name + phone_number)
    const user = await User.findOne({
      where: {
        name: name,
        phone_number: e164Phone
      },
      attributes: ['user_id', 'email', 'createdAt', 'created_at']
    });

    if (!user) {
      console.log(`[FindId] 사용자 없음: name=${name}, phone=${e164Phone}`);
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: '해당 정보로 가입된 계정을 찾을 수 없습니다.'
      });
    }

    console.log(`[FindId] 사용자 찾음: userId=${user.user_id}`);

    // 4. sessionId 및 4자리 인증번호 생성
    const sessionId = smsService.generateSessionId();
    const verificationCode = smsService.generateVerificationCode();
    console.log(`[FindId] 인증번호 생성: sessionId=${sessionId}, code=${verificationCode}`);

    // 5. 캐시에 저장 (find-id 전용 prefix)
    saveFindIdVerification(sessionId, normalizedPhone, verificationCode, user.user_id);

    // 6. SMS 발송
    const smsMessage = `[티미타카] 아이디 찾기 인증번호는 [${verificationCode}]입니다. 3분 내에 입력해주세요.`;

    // 비동기 SMS 발송
    smsService.messageService.sendOne({
      to: normalizedPhone,
      from: process.env.SOLAPI_SENDER_NUM,
      text: smsMessage
    })
      .then((result) => console.log(`[FindId] SMS 발송 성공: ${normalizedPhone}, messageId: ${result.messageId}`))
      .catch((err) => console.error(`[FindId] SMS 발송 실패: ${normalizedPhone}`, err.message));

    // 7. 즉시 응답 반환
    console.log(`[FindId] SMS 인증 요청 성공: ${normalizedPhone}`);
    return res.status(200).json({
      success: true,
      message: '인증번호가 전송되었습니다.',
      sessionId,
      expiresIn: EXPIRATION_TIME
    });

  } catch (error) {
    console.error(`[FindId] SMS 인증 요청 오류:`, error.message);

    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
};

/**
 * 아이디 찾기 인증번호 확인
 * POST /api/auth/find-id/verify
 */
exports.verifyFindIdCode = async (req, res) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const { sessionId, code } = req.body;

  try {
    console.log(`[FindId] 인증 확인 요청, sessionId=${sessionId}, IP=${clientIP}`);

    // 1. 캐시에서 인증 정보 조회
    const cached = getFindIdVerification(sessionId);

    if (!cached) {
      console.log(`[FindId] 인증번호 만료 또는 없음: sessionId=${sessionId}`);
      return res.status(410).json({
        success: false,
        error: 'CODE_EXPIRED',
        message: '인증번호가 만료되었습니다. 다시 요청해주세요.'
      });
    }

    // 2. 최대 시도 횟수 확인
    if (cached.attemptCount >= MAX_ATTEMPTS) {
      deleteFindIdVerification(sessionId);
      console.log(`[FindId] 최대 시도 횟수 초과: sessionId=${sessionId}`);
      return res.status(400).json({
        success: false,
        error: 'MAX_ATTEMPTS_EXCEEDED',
        message: '최대 시도 횟수(5회)를 초과했습니다. 인증번호를 다시 요청해주세요.'
      });
    }

    // 3. 시도 횟수 증가
    cached.attemptCount++;
    updateFindIdVerification(sessionId, cached);

    // 4. 인증번호 비교
    if (cached.code !== code) {
      const remainingAttempts = MAX_ATTEMPTS - cached.attemptCount;
      console.log(`[FindId] 인증번호 불일치: sessionId=${sessionId}, 남은 시도=${remainingAttempts}`);
      return res.status(400).json({
        success: false,
        error: 'INVALID_CODE',
        message: `인증번호가 일치하지 않습니다. (남은 시도: ${remainingAttempts}회)`
      });
    }

    // 5. 인증 성공 - 사용자 정보 조회
    const user = await User.findByPk(cached.userId, {
      attributes: ['email', 'createdAt', 'created_at']
    });

    if (!user) {
      deleteFindIdVerification(sessionId);
      console.log(`[FindId] 사용자 정보 없음: userId=${cached.userId}`);
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: '사용자 정보를 찾을 수 없습니다.'
      });
    }

    // 6. 캐시 삭제 (재사용 방지)
    deleteFindIdVerification(sessionId);

    // 7. 이메일 마스킹 및 가입일 포맷팅
    const maskedEmail = maskEmail(user.email);
    const joinDate = formatJoinDate(user.createdAt || user.created_at);

    console.log(`[FindId] 인증 성공: email=${maskedEmail}, joinDate=${joinDate}`);

    return res.status(200).json({
      success: true,
      email: maskedEmail,
      joinDate
    });

  } catch (error) {
    console.error(`[FindId] 인증 확인 오류:`, error.message);

    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
};
