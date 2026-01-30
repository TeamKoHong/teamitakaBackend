const Joi = require('joi');

// 모집공고 생성 검증 스키마
const createRecruitmentSchema = Joi.object({
  title: Joi.string()
    .required()
    .messages({
      'any.required': '제목을 입력해주세요.',
      'string.empty': '제목을 입력해주세요.'
    }),
  description: Joi.string()
    .max(20)
    .required()
    .messages({
      'any.required': '프로젝트 정보를 입력해주세요.',
      'string.empty': '프로젝트 정보를 입력해주세요.',
      'string.max': '프로젝트 정보는 20자를 초과할 수 없습니다.'
    }),
  max_applicants: Joi.number()
    .integer()
    .positive()
    .messages({
      'number.base': '최대 지원자 수는 숫자여야 합니다.',
      'number.integer': '최대 지원자 수는 정수여야 합니다.',
      'number.positive': '최대 지원자 수는 양수여야 합니다.'
    }),
  recruitment_start: Joi.date()
    .required()
    .messages({
      'any.required': '모집 시작일을 입력해주세요.',
      'date.base': '올바른 날짜 형식이 아닙니다.'
    }),
  recruitment_end: Joi.date()
    .required()
    .messages({
      'any.required': '모집 마감일을 입력해주세요.',
      'date.base': '올바른 날짜 형식이 아닙니다.'
    }),
  project_type: Joi.string()
    .valid('course', 'side')
    .messages({
      'any.only': '프로젝트 타입은 course 또는 side만 가능합니다.'
    }),
  photo: Joi.string()
    .allow('', null),
  photo_url: Joi.string()
    .allow('', null),
  hashtags: Joi.array()
    .items(Joi.string())
    .messages({
      'array.base': '해시태그는 배열 형식이어야 합니다.'
    })
});

// 모집공고 수정 검증 스키마
const updateRecruitmentSchema = Joi.object({
  title: Joi.string()
    .messages({
      'string.empty': '제목은 빈 문자열일 수 없습니다.'
    }),
  description: Joi.string()
    .max(20)
    .messages({
      'string.max': '프로젝트 정보는 20자를 초과할 수 없습니다.'
    }),
  max_applicants: Joi.number()
    .integer()
    .positive()
    .messages({
      'number.base': '최대 지원자 수는 숫자여야 합니다.',
      'number.integer': '최대 지원자 수는 정수여야 합니다.',
      'number.positive': '최대 지원자 수는 양수여야 합니다.'
    }),
  recruitment_start: Joi.date()
    .messages({
      'date.base': '올바른 날짜 형식이 아닙니다.'
    }),
  recruitment_end: Joi.date()
    .messages({
      'date.base': '올바른 날짜 형식이 아닙니다.'
    }),
  project_type: Joi.string()
    .valid('course', 'side')
    .messages({
      'any.only': '프로젝트 타입은 course 또는 side만 가능합니다.'
    }),
  photo: Joi.string()
    .allow('', null),
  photo_url: Joi.string()
    .allow('', null),
  hashtags: Joi.array()
    .items(Joi.string())
    .messages({
      'array.base': '해시태그는 배열 형식이어야 합니다.'
    }),
  status: Joi.string()
    .valid('ACTIVE', 'CLOSED', 'FILLED')
    .messages({
      'any.only': '상태는 ACTIVE, CLOSED, FILLED만 가능합니다.'
    })
});

module.exports = {
  createRecruitmentSchema,
  updateRecruitmentSchema
};
