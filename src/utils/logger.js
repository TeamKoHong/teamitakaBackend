const winston = require('winston');
const path = require('path');
const fs = require('fs');

// 로그 디렉토리 생성
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 로그 포맷 정의
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    return log;
  })
);

// 로거 인스턴스 생성
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // 에러 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // 모든 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // 인증 관련 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'verification.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 3
    })
  ]
});

// 개발 환경에서는 콘솔에도 출력
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// 로그 레벨별 헬퍼 함수들
const logVerification = (level, message, meta = {}) => {
  logger.log(level, `[VERIFICATION] ${message}`, meta);
};

const logSecurity = (level, message, meta = {}) => {
  logger.log(level, `[SECURITY] ${message}`, meta);
};

const logEmail = (level, message, meta = {}) => {
  logger.log(level, `[EMAIL] ${message}`, meta);
};

const logRateLimit = (level, message, meta = {}) => {
  logger.log(level, `[RATE_LIMIT] ${message}`, meta);
};

// 특별한 로깅 함수들
const logVerificationAttempt = (email, success, ip, userAgent, meta = {}) => {
  logVerification('info', '인증 시도', {
    email,
    success,
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

const logEmailSent = (email, messageId, provider, meta = {}) => {
  logEmail('info', '이메일 발송 성공', {
    email,
    messageId,
    provider,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

const logEmailFailed = (email, error, provider, meta = {}) => {
  logEmail('error', '이메일 발송 실패', {
    email,
    error: error.message,
    provider,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

const logRateLimitHit = (type, key, limit, meta = {}) => {
  logRateLimit('warn', '속도 제한 도달', {
    type,
    key,
    limit,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

const logSecurityEvent = (event, details, meta = {}) => {
  logSecurity('warn', `보안 이벤트: ${event}`, {
    event,
    details,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

module.exports = {
  logger,
  logVerification,
  logSecurity,
  logEmail,
  logRateLimit,
  logVerificationAttempt,
  logEmailSent,
  logEmailFailed,
  logRateLimitHit,
  logSecurityEvent
};
