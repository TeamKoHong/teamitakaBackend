const { v4: uuidv4 } = require('uuid');

module.exports = {
  async sendVerification({ to, magicLink, code, locale = 'ko' }) {
    if (!to || (!magicLink && !code)) throw new Error('to and (magicLink or code) are required');
    const requestId = uuidv4();
    // Stub: integrate SES/SMTP later. For now, just log.
    console.log(`[EmailSender][stub] to=${to} locale=${locale} requestId=${requestId}`);
    return { provider: 'stub', requestId };
  },
};


