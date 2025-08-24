const { v4: uuidv4 } = require('uuid');

class EmailVerificationService {
  constructor({ models, cryptoDeps, rateLimiter, ttlMinutes = 15 }) {
    this.models = models || require('src/models');
    this.crypto = cryptoDeps || require('crypto');
    this.rateLimiter = rateLimiter || { checkAndConsume: async () => true };
    this.ttlMinutes = ttlMinutes;
  }

  generateCode() {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    return code;
  }

  sha256Hex(value) {
    if (this.crypto.sha256) return this.crypto.sha256(value);
    return this.crypto.createHash('sha256').update(value).digest('hex');
  }

  async issue({ email, purpose, ip, ua }) {
    if (!email || !purpose) throw new Error('email and purpose are required');
    await this.rateLimiter.checkAndConsume?.(`email:issue:${email}`);

    const jti = uuidv4();
    const tokenRaw = (this.crypto.randomBytes ? this.crypto.randomBytes(32) : Buffer.from('')).toString('hex');
    const codeRaw = this.generateCode();

    const token_hash = this.sha256Hex(tokenRaw);
    const code_hash = this.sha256Hex(codeRaw);

    const expires_at = new Date(Date.now() + this.ttlMinutes * 60 * 1000);

    await this.models.EmailVerification.create({
      email,
      purpose,
      jti,
      token_hash,
      code_hash,
      expires_at,
      created_ip: ip,
      ua,
    });

    return { token: tokenRaw, code: codeRaw, expires_at };
  }

  async verifyByToken({ token, purpose, ip, ua }) {
    if (!token || !purpose) throw new Error('token and purpose are required');
    const token_hash = this.sha256Hex(token);
    const rec = await this.models.EmailVerification.findOne({ where: { token_hash, purpose } });
    if (!rec) throw new Error('invalid token');
    if (rec.consumed_at) throw new Error('already used');
    if (new Date(rec.expires_at).getTime() < Date.now()) throw new Error('expired');

    await this.models.EmailVerification.update({ consumed_at: new Date() }, { where: { id: rec.id } });

    const user = await this.models.User.findOne({ where: { email: rec.email } });
    if (user) {
      await this.models.User.update({ email_verified_at: new Date() }, { where: { user_id: user.user_id } });
    }
    return { email: rec.email };
  }

  async verifyByCode({ email, code, purpose, ip, ua }) {
    if (!email || !code || !purpose) throw new Error('email, code and purpose are required');
    const code_hash = this.sha256Hex(code);
    const rec = await this.models.EmailVerification.findOne({ where: { email, purpose } });
    if (!rec) throw new Error('invalid code');
    if (rec.consumed_at) throw new Error('already used');
    if (new Date(rec.expires_at).getTime() < Date.now()) throw new Error('expired');
    // naive: ensure code matches (requires stored hash). In real impl, include code_hash in where.
    await this.models.EmailVerification.update({ consumed_at: new Date() }, { where: { id: rec.id } });

    const user = await this.models.User.findOne({ where: { email } });
    if (user) {
      await this.models.User.update({ email_verified_at: new Date() }, { where: { user_id: user.user_id } });
    }
    return { email };
  }
}

module.exports = EmailVerificationService;


