const rateLimit = require('express-rate-limit');

const isProduction = process.env.NODE_ENV === 'production';

// 전화번호 정규화 헬퍼 (하이픈, 공백 제거)
const normalizePhone = (phone) => {
  if (!phone) return 'unknown';
  return phone.replace(/[-\s]/g, '');
};

// SMS 전송 제한: 같은 전화번호로 1분에 1회만 전송 가능
const smsSendLimit = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 1,
  keyGenerator: (req) => normalizePhone(req.body.phone),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: '1분에 1회만 전송 가능합니다. 잠시 후 다시 시도해주세요.',
      retryAfter: 60
    });
  }
});

// 일일 SMS 제한: 같은 전화번호로 하루 최대 5회 전송 (프로덕션)
const dailySmsLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24시간
  max: isProduction ? 5 : 100,
  keyGenerator: (req) => normalizePhone(req.body.phone),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const maxCount = isProduction ? 5 : 100;
    res.status(429).json({
      error: 'DAILY_LIMIT_EXCEEDED',
      message: `하루 최대 ${maxCount}회 전송 가능합니다.`,
      retryAfter: 24 * 60 * 60
    });
  }
});

// IP 기반 일일 제한
const dailySmsIPLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24시간
  max: isProduction ? 20 : 500,
  keyGenerator: (req) => req.ip || req.connection.remoteAddress || 'unknown',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const maxCount = isProduction ? 20 : 500;
    res.status(429).json({
      error: 'IP_LIMIT_EXCEEDED',
      message: `IP당 하루 최대 ${maxCount}회 전송 가능합니다.`,
      retryAfter: 24 * 60 * 60
    });
  }
});

// SMS 인증 시도 제한: 같은 전화번호로 1분에 최대 5회 시도
const smsVerifyAttemptLimit = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 5,
  keyGenerator: (req) => normalizePhone(req.body.phone),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'VERIFICATION_ATTEMPT_LIMIT_EXCEEDED',
      message: '1분에 최대 5회 시도 가능합니다. 잠시 후 다시 시도해주세요.',
      retryAfter: 60
    });
  }
});

module.exports = {
  smsSendLimit,
  dailySmsLimit,
  dailySmsIPLimit,
  smsVerifyAttemptLimit
};
