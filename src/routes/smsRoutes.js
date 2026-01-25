const express = require('express');
const router = express.Router();
const smsController = require('../controllers/smsController');
const {
  smsSendLimit,
  dailySmsLimit,
  dailySmsIPLimit,
  smsVerifyAttemptLimit
} = require('../middlewares/smsRateLimit');
const {
  validateSendSmsVerificationInput,
  validateVerifySmsCodeInput
} = require('../middlewares/validationMiddleware');

/**
 * @route   POST /api/auth/sms/send
 * @desc    SMS 인증번호 전송
 * @access  Public
 */
router.post(
  '/send',
  validateSendSmsVerificationInput,
  smsSendLimit,
  dailySmsLimit,
  dailySmsIPLimit,
  smsController.sendSmsVerification
);

/**
 * @route   POST /api/auth/sms/verify
 * @desc    SMS 인증번호 확인
 * @access  Public
 */
router.post(
  '/verify',
  validateVerifySmsCodeInput,
  smsVerifyAttemptLimit,
  smsController.verifySmsCode
);

module.exports = router;
