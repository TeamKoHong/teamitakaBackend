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

jest.mock('src/models', () => ({
  EmailVerification: {
    create: jest.fn().mockResolvedValue({ id: 'e1' }),
    findOne: jest.fn().mockResolvedValue({ 
      id: 'e1', 
      email: 'user@example.com', 
      expires_at: new Date(Date.now() + 60_000), 
      consumed_at: null,
      increment: jest.fn().mockResolvedValue()
    }),
    update: jest.fn().mockResolvedValue([1]),
  },
  User: {
    findOne: jest.fn().mockResolvedValue(null), // 중복 이메일이 없도록 설정
    update: jest.fn().mockResolvedValue([1]),
  },
}));

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

  test('POST /api/auth/send-verification returns 200 for valid request', async () => {
    const res = await request(app)
      .post('/api/auth/send-verification')
      .send({ email: 'user@example.com' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', '인증번호가 이메일로 전송되었습니다.');
  });

  test('POST /api/auth/verify-code returns 400 for invalid code', async () => {
    const res = await request(app)
      .post('/api/auth/verify-code')
      .send({ email: 'user@example.com', code: '123456' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'VERIFICATION_FAILED');
  });
});


