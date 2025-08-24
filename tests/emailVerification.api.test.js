const request = require('supertest');

jest.mock('src/models', () => ({
  EmailVerification: {
    create: jest.fn().mockResolvedValue({ id: 'e1' }),
    findOne: jest.fn().mockResolvedValue({ id: 'e1', email: 'user@example.com', expires_at: new Date(Date.now() + 60_000), consumed_at: null }),
    update: jest.fn().mockResolvedValue([1]),
  },
  User: {
    findOne: jest.fn().mockResolvedValue({ user_id: 'u1' }),
    update: jest.fn().mockResolvedValue([1]),
  },
}));

jest.mock('src/services/emailSender', () => ({
  sendVerification: jest.fn().mockResolvedValue({ provider: 'stub', requestId: 'r1' }),
}));

describe('Email Verification API', () => {
  let app;
  beforeAll(() => {
    app = require('../src/app');
  });

  test('POST /api/email/send returns 200 for valid request', async () => {
    const res = await request(app)
      .post('/api/email/send')
      .send({ email: 'user@example.com', purpose: 'signup', redirectUrl: 'https://app.example.com/verify' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Verification email sent');
  });

  test('POST /api/email/verify by token returns 200', async () => {
    const res = await request(app)
      .post('/api/email/verify')
      .send({ token: 'any-token', purpose: 'signup' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Email verified');
  });
});


