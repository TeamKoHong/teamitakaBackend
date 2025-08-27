const Joi = require('joi');

// 인증번호 전송 검증 스키마
const sendVerificationSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .max(255)
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .messages({
      'string.email': '올바른 이메일 형식이 아닙니다.',
      'any.required': '이메일을 입력해주세요.',
      'string.max': '이메일은 255자를 초과할 수 없습니다.',
      'string.pattern': '올바른 이메일 형식이 아닙니다.'
    })
});

// 인증번호 확인 검증 스키마
const verifyCodeSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .max(255)
    .messages({
      'string.email': '올바른 이메일 형식이 아닙니다.',
      'any.required': '이메일을 입력해주세요.',
      'string.max': '이메일은 255자를 초과할 수 없습니다.'
    }),
  code: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.length': '인증번호는 6자리여야 합니다.',
      'string.pattern': '인증번호는 6자리 숫자여야 합니다.',
      'any.required': '인증번호를 입력해주세요.'
    })
});

// 인증 상태 확인 검증 스키마
const verificationStatusSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .max(255)
    .messages({
      'string.email': '올바른 이메일 형식이 아닙니다.',
      'any.required': '이메일을 입력해주세요.',
      'string.max': '이메일은 255자를 초과할 수 없습니다.'
    })
});

// 인증번호 재전송 검증 스키마
const resendVerificationSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .max(255)
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .messages({
      'string.email': '올바른 이메일 형식이 아닙니다.',
      'any.required': '이메일을 입력해주세요.',
      'string.max': '이메일은 255자를 초과할 수 없습니다.',
      'string.pattern': '올바른 이메일 형식이 아닙니다.'
    })
});

// 검증 함수들
const validateSendVerification = (data) => {
  return sendVerificationSchema.validate(data, { abortEarly: false });
};

const validateVerifyCode = (data) => {
  return verifyCodeSchema.validate(data, { abortEarly: false });
};

const validateVerificationStatus = (data) => {
  return verificationStatusSchema.validate(data, { abortEarly: false });
};

const validateResendVerification = (data) => {
  return resendVerificationSchema.validate(data, { abortEarly: false });
};

module.exports = {
  sendVerificationSchema,
  verifyCodeSchema,
  verificationStatusSchema,
  resendVerificationSchema,
  validateSendVerification,
  validateVerifyCode,
  validateVerificationStatus,
  validateResendVerification
};
