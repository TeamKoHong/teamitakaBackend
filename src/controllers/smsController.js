const smsService = require('../services/smsService');
const { User } = require('../models');
const { formatPhoneNumber } = require('../utils/registrationUtils');

/**
 * SMS 인증번호 전송
 * POST /api/auth/sms/send
 */
exports.sendSmsVerification = async (req, res) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  let phone = '';

  try {
    phone = req.body.phone;

    console.log(`[SMS] 인증 요청 시작: ${phone}, IP: ${clientIP}`);

    // 1. 전화번호 검증 (validation middleware에서 이미 처리됨)
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PHONE_NUMBER',
        message: '전화번호를 입력해주세요.'
      });
    }

    // 2. 전화번호 정규화
    const normalizedPhone = smsService.normalizePhone(phone);

    if (!smsService.validatePhoneFormat(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PHONE_FORMAT',
        message: '올바른 전화번호 형식이 아닙니다. (예: 01012345678)'
      });
    }

    // 3. 전화번호 중복 체크 (E.164 형식으로 변환하여 DB 조회)
    const e164Phone = formatPhoneNumber(normalizedPhone);
    console.log(`[SMS] E.164 형식: ${e164Phone}`);

    if (e164Phone) {
      const existingUser = await User.findOne({
        where: { phone_number: e164Phone }
      });

      if (existingUser) {
        console.log(`[SMS] 중복 전화번호 감지: ${e164Phone}`);
        return res.status(409).json({
          success: false,
          error: 'DUPLICATE_PHONE',
          message: '이미 가입된 전화번호입니다.'
        });
      }
    }

    // 4. sessionId 및 인증번호 생성
    const sessionId = smsService.generateSessionId();
    const verificationCode = smsService.generateVerificationCode();
    console.log(`[SMS] 인증번호 생성: ${normalizedPhone}, sessionId: ${sessionId}`);

    // 5. 캐시에 저장 (sessionId 기반)
    smsService.saveVerification(sessionId, normalizedPhone, verificationCode);

    // 6. 비동기 SMS 발송 (백그라운드에서 처리)
    smsService.sendSms(normalizedPhone, verificationCode)
      .then(() => console.log(`[SMS] 발송 완료: ${normalizedPhone}`))
      .catch(err => console.error(`[SMS] 발송 실패: ${normalizedPhone}`, err.message));

    // 7. 즉시 응답 반환
    console.log(`[SMS] 인증 요청 성공: ${normalizedPhone}`);
    res.status(200).json({
      success: true,
      message: '인증번호가 전송되었습니다.',
      data: {
        sessionId: sessionId,
        phone: normalizedPhone,
        expiresIn: 180 // 3분 (초 단위)
      }
    });

  } catch (error) {
    console.error(`[SMS] 오류 발생: ${phone}`, error.message);

    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message || '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
};

/**
 * SMS 인증번호 확인
 * POST /api/auth/sms/verify
 */
exports.verifySmsCode = async (req, res) => {
  const clientIP = req.ip || req.connection.remoteAddress;

  try {
    const { sessionId, code } = req.body;

    console.log(`[SMS] 인증 확인 요청, sessionId: ${sessionId}, IP: ${clientIP}`);

    // 1. sessionId 필수
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_SESSION_ID',
        message: 'sessionId를 입력해주세요.'
      });
    }

    // 2. code 필수
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_CODE',
        message: '인증번호를 입력해주세요.'
      });
    }

    // 3. 인증번호 형식 검증
    if (code.length !== 4 || !/^\d{4}$/.test(code)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_CODE_FORMAT',
        message: '4자리 숫자 인증번호를 입력해주세요.'
      });
    }

    // 4. 인증번호 검증 (sessionId 기반)
    const verificationResult = smsService.verifyCode(sessionId, code);

    if (!verificationResult.valid) {
      console.log(`[SMS] 인증 실패: sessionId=${sessionId} - ${verificationResult.message}`);

      return res.status(400).json({
        success: false,
        error: 'VERIFICATION_FAILED',
        message: verificationResult.message
      });
    }

    // 5. 성공 응답
    console.log(`[SMS] 인증 성공: ${verificationResult.phone}`);
    res.status(200).json({
      success: true,
      message: '인증이 완료되었습니다.',
      data: {
        phone: verificationResult.phone,
        verifiedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error(`[SMS] 인증 확인 오류:`, error.message);

    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
};
