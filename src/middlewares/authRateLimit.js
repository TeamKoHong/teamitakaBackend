const rateLimit = require("express-rate-limit");

const isProduction = process.env.NODE_ENV === "production";

const getRequesterIp = (req) =>
  req.ip || req.connection?.remoteAddress || "unknown";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 10 : 100,
  keyGenerator: (req) => `${getRequesterIp(req)}:${normalizeEmail(req.body?.email)}`,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "LOGIN_RATE_LIMIT_EXCEEDED",
      message: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.",
      retryAfter: Math.ceil((15 * 60 * 1000) / 1000),
    });
  },
});

const registerRateLimit = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: isProduction ? 5 : 50,
  keyGenerator: (req) => `${getRequesterIp(req)}:${normalizeEmail(req.body?.email || req.body?.schoolEmail)}`,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "REGISTER_RATE_LIMIT_EXCEEDED",
      message: "회원가입 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.",
      retryAfter: Math.ceil((30 * 60 * 1000) / 1000),
    });
  },
});

module.exports = {
  loginRateLimit,
  registerRateLimit,
};
