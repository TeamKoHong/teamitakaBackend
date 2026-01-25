const { v4: uuidv4 } = require('uuid');

jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('EmailVerificationService', () => {
  const now = new Date('2025-01-01T00:00:00Z');
  const makeService = () => {
    jest.useFakeTimers().setSystemTime(now);

    const models = {
      EmailVerification: {
        create: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
      },
      User: {
        findOne: jest.fn(),
        update: jest.fn(),
      },
    };

    const cryptoDeps = {
      randomBytes: (n) => Buffer.from('a'.repeat(n)),
      sha256: (input) => 'hash:' + input,
    };

    const rateLimiter = { checkAndConsume: jest.fn().mockResolvedValue(true) };

    const Service = require('../src/services/emailVerificationService');
    const svc = new Service({ models, cryptoDeps, rateLimiter, ttlMinutes: 15 });
    return { svc, models };
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test('issue() stores hashed token/code with TTL and returns public payload', async () => {
    const { svc, models } = makeService();
    models.EmailVerification.create.mockResolvedValue({ id: uuidv4() });

    const result = await svc.issue({ email: 'user@example.com', purpose: 'signup', ip: '1.1.1.1', ua: 'jest' });

    expect(models.EmailVerification.create).toHaveBeenCalledWith(expect.objectContaining({
      email: 'user@example.com',
      purpose: 'signup',
      token_hash: expect.stringMatching(/^hash:/),
      code_hash: expect.stringMatching(/^hash:/),
      expires_at: new Date('2025-01-01T00:15:00.000Z'),
      created_ip: '1.1.1.1',
      ua: 'jest',
    }));

    expect(result.token).toBeDefined();
    expect(result.code).toHaveLength(6);
  });

  test('verifyByToken() marks consumed and sets user email_verified_at', async () => {
    const { svc, models } = makeService();
    const token = 'dummy-token';
    const tokenHash = 'hash:' + token;
    models.EmailVerification.findOne.mockResolvedValue({ id: 'id1', email: 'user@example.com', expires_at: new Date(now.getTime() + 1), consumed_at: null });
    models.User.findOne.mockResolvedValue({ user_id: 'u1' });

    await svc.verifyByToken({ token, purpose: 'signup', ip: '1.1.1.1', ua: 'jest' });

    expect(models.EmailVerification.findOne).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ token_hash: tokenHash, purpose: 'signup' }),
    }));
    expect(models.EmailVerification.update).toHaveBeenCalledWith(expect.objectContaining({ consumed_at: expect.any(Date) }), expect.any(Object));
    expect(models.User.update).toHaveBeenCalledWith(expect.objectContaining({ email_verified_at: expect.any(Date) }), expect.any(Object));
  });

  test('verifyByCode() validates code and consumes record', async () => {
    const { svc, models } = makeService();
    const email = 'user@example.com';
    const code = '123456';
    models.EmailVerification.findOne.mockResolvedValue({ id: 'id1', email, expires_at: new Date(now.getTime() + 1), consumed_at: null });
    models.User.findOne.mockResolvedValue({ user_id: 'u1' });

    await svc.verifyByCode({ email, code, purpose: 'signup', ip: '1.1.1.1', ua: 'jest' });

    expect(models.EmailVerification.update).toHaveBeenCalled();
    expect(models.User.update).toHaveBeenCalled();
  });
});


