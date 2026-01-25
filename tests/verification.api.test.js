const request = require('supertest');

// Mock database config to prevent DB connection
jest.mock('src/config/db', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(),
    sync: jest.fn().mockResolvedValue(),
    define: jest.fn(),
    query: jest.fn(),
  },
  connectDB: jest.fn().mockResolvedValue(true),
}));

// Mock models to prevent DB connection issues in CI
jest.mock('src/models', () => ({
  User: {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    update: jest.fn(),
  },
  EmailVerification: {
    create: jest.fn().mockResolvedValue({ id: 'e1' }),
    findOne: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue([1]),
  },
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(),
    sync: jest.fn().mockResolvedValue(),
  },
}));

// Mock verification service
jest.mock('src/services/verificationService', () => ({
  validateEmailFormat: jest.fn().mockReturnValue(true),
  checkDuplicateEmail: jest.fn().mockResolvedValue(false),
  generateVerificationCode: jest.fn().mockReturnValue('123456'),
  invalidatePreviousCodes: jest.fn().mockResolvedValue(),
  saveVerification: jest.fn().mockResolvedValue(true),
  sendVerificationEmail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  verifyCode: jest.fn().mockResolvedValue({ valid: false, message: '유효하지 않은 인증번호입니다.' }),
  getVerificationStatus: jest.fn().mockResolvedValue({ hasActiveCode: false, remainingTime: 0 }),
}));

describe('Email Verification API', () => {
  let app;

  beforeAll(() => {
    app = require('../src/app');
  });
  describe('POST /api/auth/send-verification', () => {
    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/send-verification')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toBe('입력값 검증에 실패했습니다.');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/send-verification')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toBe('입력값 검증에 실패했습니다.');
    });
  });

  describe('POST /api/auth/verify-code', () => {
    it('should return 400 for invalid code format', async () => {
      const response = await request(app)
        .post('/api/auth/verify-code')
        .send({ 
          email: 'test@korea.ac.kr', 
          code: '12345' // 5자리
        })
        .expect(400);

      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toBe('입력값 검증에 실패했습니다.');
    });

    it('should return 400 for missing parameters', async () => {
      const response = await request(app)
        .post('/api/auth/verify-code')
        .send({ email: 'test@korea.ac.kr' })
        .expect(400);

      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toBe('입력값 검증에 실패했습니다.');
    });
  });

  describe('GET /api/auth/status', () => {
    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .get('/api/auth/status')
        .expect(400);

      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toBe('입력값 검증에 실패했습니다.');
    });
  });
});
