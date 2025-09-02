const verificationService = require('../services/verificationService');
const { 
  logVerificationAttempt, 
  logEmailSent, 
  logEmailFailed, 
  logSecurityEvent 
} = require('../utils/logger');

// 인증번호 전송
exports.sendVerification = async (req, res) => {
  let email, clientIP, userAgent;
  
  try {
    email = req.body.email;
    clientIP = req.ip || req.connection.remoteAddress;
    userAgent = req.get('User-Agent');

    console.log(`[VERIFICATION] 인증 요청 시작: ${email}, IP: ${clientIP}`);

    // 1. 이메일 형식 검증
    if (!email) {
      console.log('[VERIFICATION] 이메일 누락');
      return res.status(400).json({
        error: 'MISSING_EMAIL',
        message: '이메일을 입력해주세요.'
      });
    }

    if (!verificationService.validateEmailFormat(email)) {
      console.log(`[VERIFICATION] 잘못된 이메일 형식: ${email}`);
      return res.status(400).json({
        error: 'INVALID_EMAIL_FORMAT',
        message: '올바른 이메일 형식이 아닙니다.'
      });
    }

    console.log(`[VERIFICATION] 이메일 형식 검증 통과: ${email}`);

    // 2. 중복 이메일 확인
    console.log(`[VERIFICATION] 중복 이메일 확인 중: ${email}`);
    const isDuplicate = await verificationService.checkDuplicateEmail(email);
    if (isDuplicate) {
      console.log(`[VERIFICATION] 중복 이메일 발견: ${email}`);
      return res.status(409).json({
        error: 'DUPLICATE_EMAIL',
        message: '이미 등록된 이메일입니다.'
      });
    }

    console.log(`[VERIFICATION] 중복 이메일 확인 통과: ${email}`);

    // 3. 인증번호 생성
    const verificationCode = verificationService.generateVerificationCode();
    console.log(`[VERIFICATION] 인증번호 생성 완료: ${email}, 코드: ${verificationCode.substring(0, 2)}****`);
    
    // 4. 이전 인증번호 무효화
    console.log(`[VERIFICATION] 이전 인증번호 무효화 중: ${email}`);
    await verificationService.invalidatePreviousCodes(email);
    console.log(`[VERIFICATION] 이전 인증번호 무효화 완료: ${email}`);
    
    // 5. 인증번호 저장
    console.log(`[VERIFICATION] 인증번호 저장 중: ${email}`);
    await verificationService.saveVerification(email, verificationCode, clientIP, userAgent);
    console.log(`[VERIFICATION] 인증번호 저장 완료: ${email}`);
    
    // 6. 이메일 발송
    console.log(`[VERIFICATION] 이메일 발송 시작: ${email}`);
    const emailResult = await verificationService.sendVerificationEmail(email, verificationCode);
    console.log(`[VERIFICATION] 이메일 발송 완료: ${email}, Message ID: ${emailResult.messageId || 'N/A'}`);
    
    // 7. 성공 응답
    logEmailSent(email, emailResult.messageId, 'sendgrid', { ip: clientIP });
    
    console.log(`[VERIFICATION] 인증 요청 성공: ${email}`);
    res.status(200).json({
      success: true,
      message: '인증번호가 이메일로 전송되었습니다.',
      data: {
        email: email,
        expiresIn: 180 // 3분 (초 단위)
      }
    });

  } catch (error) {
    // 에러 로깅 시 변수가 정의되지 않았을 수 있으므로 안전하게 처리
    const errorEmail = email || 'unknown';
    const errorIP = clientIP || 'unknown';
    
    console.error(`[VERIFICATION] 오류 발생: ${errorEmail}`);
    console.error(`[VERIFICATION] 오류 상세:`, error);
    console.error(`[VERIFICATION] 오류 스택:`, error.stack);
    console.error(`[VERIFICATION] 환경 정보: NODE_ENV=${process.env.NODE_ENV}, DB_HOST=${process.env.GCP_DB_HOST || 'N/A'}`);
    
    logEmailFailed(errorEmail, error, 'sendgrid', { ip: errorIP });
    
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
};

// 인증번호 확인
exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;

    // 1. 입력값 검증
    if (!email || !code) {
      return res.status(400).json({
        error: 'MISSING_PARAMETERS',
        message: '이메일과 인증번호를 모두 입력해주세요.'
      });
    }

    if (!verificationService.validateEmailFormat(email)) {
      return res.status(400).json({
        error: 'INVALID_EMAIL_FORMAT',
        message: '올바른 이메일 형식이 아닙니다.'
      });
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return res.status(400).json({
        error: 'INVALID_CODE_FORMAT',
        message: '6자리 숫자 인증번호를 입력해주세요.'
      });
    }

    // 2. 인증번호 검증
    const verificationResult = await verificationService.verifyCode(email, code);
    
    if (!verificationResult.valid) {
      logVerificationAttempt(email, false, clientIP, req.get('User-Agent'), { 
        code: code.substring(0, 2) + '****' 
      });
      
      return res.status(400).json({
        error: 'VERIFICATION_FAILED',
        message: verificationResult.message
      });
    }

    // 3. 성공 응답
    logVerificationAttempt(email, true, clientIP, req.get('User-Agent'));
    
    res.status(200).json({
      success: true,
      message: '이메일 인증이 완료되었습니다.',
      data: {
        email: email,
        verifiedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logSecurityEvent('인증번호 확인 오류', { email, error: error.message }, { ip: clientIP });
    
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
};

// 인증 상태 확인
exports.getVerificationStatus = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        error: 'MISSING_EMAIL',
        message: '이메일을 입력해주세요.'
      });
    }

    if (!verificationService.validateEmailFormat(email)) {
      return res.status(400).json({
        error: 'INVALID_EMAIL_FORMAT',
        message: '올바른 이메일 형식이 아닙니다.'
      });
    }

    const status = await verificationService.getVerificationStatus(email);
    
    res.status(200).json({
      success: true,
      data: status
    });

  } catch (error) {
    logger.error('인증 상태 확인 중 오류:', error);
    
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
};

// 인증번호 재전송
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // 1. 이메일 형식 검증
    if (!email) {
      return res.status(400).json({
        error: 'MISSING_EMAIL',
        message: '이메일을 입력해주세요.'
      });
    }

    if (!verificationService.validateEmailFormat(email)) {
      return res.status(400).json({
        error: 'INVALID_EMAIL_FORMAT',
        message: '올바른 이메일 형식이 아닙니다.'
      });
    }

    // 2. 중복 이메일 확인
    const isDuplicate = await verificationService.checkDuplicateEmail(email);
    if (isDuplicate) {
      return res.status(409).json({
        error: 'DUPLICATE_EMAIL',
        message: '이미 등록된 이메일입니다.'
      });
    }

    // 3. 새로운 인증번호 생성
    const verificationCode = verificationService.generateVerificationCode();
    
    // 4. 이전 인증번호 무효화
    await verificationService.invalidatePreviousCodes(email);
    
    // 5. 새 인증번호 저장
    await verificationService.saveVerification(email, verificationCode, clientIP, userAgent);
    
    // 6. 이메일 발송
    await verificationService.sendVerificationEmail(email, verificationCode);
    
    // 7. 성공 응답
    logger.info(`인증번호 재전송 성공: ${email}`, { ip: clientIP });
    
    res.status(200).json({
      success: true,
      message: '새로운 인증번호가 이메일로 전송되었습니다.',
      data: {
        email: email,
        expiresIn: 180 // 3분 (초 단위)
      }
    });

  } catch (error) {
    logger.error('인증번호 재전송 중 오류:', error);
    
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
};
