const request = require('supertest');

jest.mock('src/utils/googleTokenVerifier', () => ({
  verifyGoogleIdToken: jest.fn(async (token, aud) => ({
    email: 'guser@example.com',
    email_verified: true,
    sub: 'sub-123',
    name: 'Google User',
  })),
}));

jest.mock('src/models', () => ({
  User: {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ user_id: 'u1', email: 'guser@example.com', role: 'MEMBER' }),
    update: jest.fn().mockResolvedValue([1]),
  },
}));

describe('Google Social Login API', () => {
  let app;
  beforeAll(() => {
    process.env.GOOGLE_OAUTH_CLIENT_ID = 'test-client-id';
    app = require('../src/app');
  });

  test('POST /api/auth/google/id-token returns 200 and token', async () => {
    const res = await request(app)
      .post('/api/auth/google/id-token')
      .send({ idToken: 'dummy' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});


