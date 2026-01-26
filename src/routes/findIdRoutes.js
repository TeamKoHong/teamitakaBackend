const express = require('express');
const router = express.Router();
const findIdController = require('../controllers/findIdController');
const {
  validateSendFindIdSms,
  validateVerifyFindIdCode
} = require('../validations/findIdValidation');
const {
  smsSendLimit,
  dailySmsLimit,
  dailySmsIPLimit,
  smsVerifyAttemptLimit
} = require('../middlewares/smsRateLimit');

/**
 * @route   POST /api/auth/find-id/send-sms
 * @desc    아이디 찾기 - SMS 인증번호 전송
 * @access  Public
 *
 * @body    {string} name - 사용자 이름
 * @body    {string} carrier - 통신사 (SKT, KT, LGU, BUDGET) - optional
 * @body    {string} phone - 전화번호 (010-1234-5678 또는 01012345678)
 *
 * @response 200 - 인증번호 전송 성공
 *   {
 *     "success": true,
 *     "message": "인증번호가 전송되었습니다.",
 *     "sessionId": "uuid-v4",
 *     "expiresIn": 180
 *   }
 *
 * @response 404 - 사용자 없음
 *   {
 *     "success": false,
 *     "error": "USER_NOT_FOUND",
 *     "message": "해당 정보로 가입된 계정을 찾을 수 없습니다."
 *   }
 *
 * @response 429 - 요청 횟수 초과
 *   {
 *     "error": "RATE_LIMIT_EXCEEDED",
 *     "message": "1분에 1회만 전송 가능합니다. 잠시 후 다시 시도해주세요.",
 *     "retryAfter": 60
 *   }
 */
router.post(
  '/send-sms',
  validateSendFindIdSms,
  smsSendLimit,
  dailySmsLimit,
  dailySmsIPLimit,
  findIdController.sendFindIdSms
);

/**
 * @route   POST /api/auth/find-id/verify
 * @desc    아이디 찾기 - 인증번호 확인 및 아이디 조회
 * @access  Public
 *
 * @body    {string} sessionId - 세션 ID (send-sms에서 반환된 값)
 * @body    {string} code - 6자리 인증번호
 *
 * @response 200 - 인증 성공
 *   {
 *     "success": true,
 *     "email": "hong****@example.com",
 *     "joinDate": "2024.01.15"
 *   }
 *
 * @response 400 - 인증번호 불일치
 *   {
 *     "success": false,
 *     "error": "INVALID_CODE",
 *     "message": "인증번호가 일치하지 않습니다."
 *   }
 *
 * @response 410 - 인증번호 만료
 *   {
 *     "success": false,
 *     "error": "CODE_EXPIRED",
 *     "message": "인증번호가 만료되었습니다. 다시 요청해주세요."
 *   }
 */
router.post(
  '/verify',
  validateVerifyFindIdCode,
  smsVerifyAttemptLimit,
  findIdController.verifyFindIdCode
);

module.exports = router;
