const Joi = require('joi');

// 한국 휴대폰 번호 정규식 (하이픈 포함 또는 미포함)
const KOREAN_PHONE_REGEX = /^01[016789][-]?[0-9]{3,4}[-]?[0-9]{4}$/;

// 통신사 목록
const CARRIERS = ['SKT', 'KT', 'LGU', 'BUDGET'];

/**
 * 아이디 찾기 SMS 전송 검증 스키마
 */
const sendFindIdSmsSchema = Joi.object({
  name: Joi.string()
    .required()
    .min(2)
    .max(50)
    .messages({
      'any.required': '이름을 입력해주세요.',
      'string.empty': '이름을 입력해주세요.',
      'string.min': '이름은 2자 이상이어야 합니다.',
      'string.max': '이름은 50자 이하여야 합니다.'
    }),
  carrier: Joi.string()
    .valid(...CARRIERS)
    .optional()
    .messages({
      'any.only': '올바른 통신사를 선택해주세요. (SKT, KT, LGU, BUDGET)'
    }),
  phone: Joi.string()
    .required()
    .pattern(KOREAN_PHONE_REGEX)
    .messages({
      'any.required': '전화번호를 입력해주세요.',
      'string.empty': '전화번호를 입력해주세요.',
      'string.pattern.base': '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678 또는 01012345678)'
    })
});

/**
 * 아이디 찾기 인증번호 확인 검증 스키마
 */
const verifyFindIdCodeSchema = Joi.object({
  sessionId: Joi.string()
    .uuid()
    .required()
    .messages({
      'any.required': 'sessionId를 입력해주세요.',
      'string.empty': 'sessionId를 입력해주세요.',
      'string.guid': '유효한 sessionId 형식이 아닙니다.'
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

/**
 * 검증 미들웨어 생성 함수
 */
const createValidationMiddleware = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '입력값 검증에 실패했습니다.',
        details
      });
    }

    next();
  };
};

// 미들웨어 exports
const validateSendFindIdSms = createValidationMiddleware(sendFindIdSmsSchema);
const validateVerifyFindIdCode = createValidationMiddleware(verifyFindIdCodeSchema);

module.exports = {
  sendFindIdSmsSchema,
  verifyFindIdCodeSchema,
  validateSendFindIdSms,
  validateVerifyFindIdCode
};
