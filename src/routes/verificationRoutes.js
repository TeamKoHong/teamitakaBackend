const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const { 
  emailSendLimit, 
  dailyEmailLimit, 
  dailyIPLimit, 
  verificationAttemptLimit,
  testDailyEmailLimit,
  testDailyIPLimit
} = require('../middlewares/verificationRateLimit');
const {
  validateSendVerificationInput,
  validateVerifyCodeInput,
  validateVerificationStatusInput,
  validateResendVerificationInput
} = require('../middlewares/validationMiddleware');

// 인증번호 전송 (속도 제한 적용)
router.post('/send-verification', 
  validateSendVerificationInput,  // 입력값 검증
  emailSendLimit,                 // 1분에 1회
  process.env.NODE_ENV === 'production' ? dailyEmailLimit : testDailyEmailLimit,  // 환경별 일일 제한
  process.env.NODE_ENV === 'production' ? dailyIPLimit : testDailyIPLimit,        // 환경별 IP 제한
  verificationController.sendVerification
);

// 인증번호 확인 (시도 횟수 제한)
router.post('/verify-code',
  validateVerifyCodeInput,      // 입력값 검증
  verificationAttemptLimit,     // 1분에 5회
  verificationController.verifyCode
);

// 인증 상태 확인
router.get('/status', 
  validateVerificationStatusInput,  // 입력값 검증
  verificationController.getVerificationStatus
);

// 인증번호 재전송 (속도 제한 적용)
router.post('/resend-verification',
  validateResendVerificationInput,  // 입력값 검증
  emailSendLimit,                   // 1분에 1회
  process.env.NODE_ENV === 'production' ? dailyEmailLimit : testDailyEmailLimit,  // 환경별 일일 제한
  process.env.NODE_ENV === 'production' ? dailyIPLimit : testDailyIPLimit,        // 환경별 IP 제한
  verificationController.resendVerification
);

module.exports = router;
