const rateLimit = require('express-rate-limit');

// 이메일 전송 제한: 같은 이메일로 1분에 1회만 전송 가능
const emailSendLimit = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 1, // 같은 이메일로 1회
  keyGenerator: (req) => req.body.email,
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: '1분에 1회만 전송 가능합니다.',
    retryAfter: Math.ceil(60 / 1000) // 60초
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: '1분에 1회만 전송 가능합니다.',
      retryAfter: 60
    });
  }
});

// 일일 이메일 제한: 같은 이메일로 하루 최대 5회 전송
const dailyEmailLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24시간
  max: 5, // 같은 이메일로 5회
  keyGenerator: (req) => req.body.email,
  message: {
    error: 'DAILY_LIMIT_EXCEEDED',
    message: '하루 최대 5회 전송 가능합니다.',
    retryAfter: Math.ceil(24 * 60 * 60 / 1000) // 24시간
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'DAILY_LIMIT_EXCEEDED',
      message: '하루 최대 5회 전송 가능합니다.',
      retryAfter: 24 * 60 * 60
    });
  }
});

// IP 기반 일일 제한: 같은 IP에서 하루 최대 20회 전송
const dailyIPLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24시간
  max: 20, // 같은 IP에서 20회
  keyGenerator: (req) => req.ip || req.connection.remoteAddress,
  message: {
    error: 'IP_LIMIT_EXCEEDED',
    message: '하루 최대 20회 전송 가능합니다.',
    retryAfter: Math.ceil(24 * 60 * 60 / 1000) // 24시간
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'IP_LIMIT_EXCEEDED',
      message: '하루 최대 20회 전송 가능합니다.',
      retryAfter: 24 * 60 * 60
    });
  }
});

// 인증번호 확인 제한: 같은 이메일로 1분에 최대 5회 시도
const verificationAttemptLimit = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 5, // 같은 이메일로 5회
  keyGenerator: (req) => req.body.email,
  message: {
    error: 'VERIFICATION_ATTEMPT_LIMIT_EXCEEDED',
    message: '1분에 최대 5회 시도 가능합니다.',
    retryAfter: Math.ceil(60 / 1000) // 60초
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'VERIFICATION_ATTEMPT_LIMIT_EXCEEDED',
      message: '1분에 최대 5회 시도 가능합니다.',
      retryAfter: 60
    });
  }
});

module.exports = {
  emailSendLimit,
  dailyEmailLimit,
  dailyIPLimit,
  verificationAttemptLimit
};
