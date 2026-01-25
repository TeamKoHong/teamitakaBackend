const {
  validateSendVerification,
  validateVerifyCode,
  validateVerificationStatus,
  validateResendVerification
} = require('../validations/verificationValidation');
const {
  validateSendSmsVerification,
  validateVerifySmsCode
} = require('../validations/smsValidation');

// 검증 에러 응답 포맷
const createValidationError = (details) => {
  const errors = details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message
  }));
  
  return {
    error: 'VALIDATION_ERROR',
    message: '입력값 검증에 실패했습니다.',
    details: errors
  };
};

// 인증번호 전송 검증 미들웨어
const validateSendVerificationInput = (req, res, next) => {
  const { error, value } = validateSendVerification(req.body);
  
  if (error) {
    return res.status(400).json(createValidationError(error.details));
  }
  
  // 검증된 데이터를 req.body에 할당
  req.body = value;
  next();
};

// 인증번호 확인 검증 미들웨어
const validateVerifyCodeInput = (req, res, next) => {
  const { error, value } = validateVerifyCode(req.body);
  
  if (error) {
    return res.status(400).json(createValidationError(error.details));
  }
  
  // 검증된 데이터를 req.body에 할당
  req.body = value;
  next();
};

// 인증 상태 확인 검증 미들웨어
const validateVerificationStatusInput = (req, res, next) => {
  const { error, value } = validateVerificationStatus(req.query);
  
  if (error) {
    return res.status(400).json(createValidationError(error.details));
  }
  
  // 검증된 데이터를 req.query에 할당
  req.query = value;
  next();
};

// 인증번호 재전송 검증 미들웨어
const validateResendVerificationInput = (req, res, next) => {
  const { error, value } = validateResendVerification(req.body);
  
  if (error) {
    return res.status(400).json(createValidationError(error.details));
  }
  
  // 검증된 데이터를 req.body에 할당
  req.body = value;
  next();
};

// 범용 검증 미들웨어 (스키마를 매개변수로 받음)
const validateInput = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body || req.query, {
      abortEarly: false
    });

    if (error) {
      return res.status(400).json(createValidationError(error.details));
    }

    // 검증된 데이터를 원래 위치에 할당
    if (req.body) {
      req.body = value;
    } else if (req.query) {
      req.query = value;
    }

    next();
  };
};

// SMS 인증번호 전송 검증 미들웨어
const validateSendSmsVerificationInput = (req, res, next) => {
  const { error, value } = validateSendSmsVerification(req.body);

  if (error) {
    return res.status(400).json(createValidationError(error.details));
  }

  req.body = value;
  next();
};

// SMS 인증번호 확인 검증 미들웨어
const validateVerifySmsCodeInput = (req, res, next) => {
  const { error, value } = validateVerifySmsCode(req.body);

  if (error) {
    return res.status(400).json(createValidationError(error.details));
  }

  req.body = value;
  next();
};

module.exports = {
  validateSendVerificationInput,
  validateVerifyCodeInput,
  validateVerificationStatusInput,
  validateResendVerificationInput,
  validateInput,
  validateSendSmsVerificationInput,
  validateVerifySmsCodeInput
};
