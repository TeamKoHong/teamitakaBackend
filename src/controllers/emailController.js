const EmailVerificationService = require('../services/emailVerificationService');
const emailSender = require('../services/emailSender');
const { sequelize } = require('../config/db');

const service = new EmailVerificationService({});

exports.send = async (req, res) => {
  try {
    const { email, purpose, redirectUrl } = req.body || {};
    if (!email || !purpose) return res.status(400).json({ error: 'email and purpose are required' });
    const { token, code, expires_at } = await service.issue({ email, purpose, ip: req.ip, ua: req.headers['user-agent'] });
    const magicLink = redirectUrl ? `${redirectUrl}?token=${encodeURIComponent(token)}&purpose=${encodeURIComponent(purpose)}` : undefined;
    await emailSender.sendVerification({ to: email, magicLink, code });
    return res.status(200).json({ message: 'Verification email sent', expires_at });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'internal error' });
  }
};

exports.verify = async (req, res) => {
  try {
    const { token, email, code, purpose } = req.body || {};
    if (!purpose) return res.status(400).json({ error: 'purpose is required' });
    if (!token && !(email && code)) return res.status(400).json({ error: 'token or (email and code) is required' });

    if (token) {
      const result = await service.verifyByToken({ token, purpose, ip: req.ip, ua: req.headers['user-agent'] });
      return res.status(200).json({ message: 'Email verified', email: result.email });
    }
    const result = await service.verifyByCode({ email, code, purpose, ip: req.ip, ua: req.headers['user-agent'] });
    return res.status(200).json({ message: 'Email verified', email: result.email });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'verification failed' });
  }
};


