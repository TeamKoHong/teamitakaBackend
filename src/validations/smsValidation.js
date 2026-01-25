const Joi = require('joi');

// 한국 휴대폰 번호 정규식 (01로 시작하는 10-11자리)
const KOREAN_PHONE_REGEX = /^01[016789][0-9]{7,8}$/;

// SMS 인증번호 전송 검증 스키마
const sendSmsVerificationSchema = Joi.object({
  phone: Joi.string()
    .required()
    .pattern(KOREAN_PHONE_REGEX)
    .messages({
      'any.required': '전화번호를 입력해주세요.',
      'string.empty': '전화번호를 입력해주세요.',
      'string.pattern.base': '올바른 전화번호 형식이 아닙니다. (예: 01012345678)'
    })
});

// SMS 인증번호 확인 검증 스키마
const verifySmsCodeSchema = Joi.object({
  phone: Joi.string()
    .required()
    .pattern(KOREAN_PHONE_REGEX)
    .messages({
      'any.required': '전화번호를 입력해주세요.',
      'string.empty': '전화번호를 입력해주세요.',
      'string.pattern.base': '올바른 전화번호 형식이 아닙니다.'
    }),
  code: Joi.string()
    .length(4)
    .pattern(/^\d{4}$/)
    .required()
    .messages({
      'string.length': '인증번호는 4자리여야 합니다.',
      'string.pattern.base': '인증번호는 4자리 숫자여야 합니다.',
      'any.required': '인증번호를 입력해주세요.',
      'string.empty': '인증번호를 입력해주세요.'
    })
});

// 검증 함수들
const validateSendSmsVerification = (data) => {
  return sendSmsVerificationSchema.validate(data, { abortEarly: false });
};

const validateVerifySmsCode = (data) => {
  return verifySmsCodeSchema.validate(data, { abortEarly: false });
};

module.exports = {
  sendSmsVerificationSchema,
  verifySmsCodeSchema,
  validateSendSmsVerification,
  validateVerifySmsCode
};
