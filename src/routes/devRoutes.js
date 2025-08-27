const express = require("express");
const router = express.Router();
const devController = require("../controllers/devController");
const { createTransporter, getFromEmail, sendEmailWithSendGrid } = require("../config/emailConfig");

router.delete("/clear-verified-emails", devController.clearVerifiedEmails);

// SendGrid 연결 테스트 엔드포인트 (개발 환경에서만 사용)
router.post("/test-sendgrid", async (req, res) => {
  try {
    const { testEmail = 'test@example.com' } = req.body;
    
    const mailOptions = {
      from: getFromEmail(),
      to: testEmail,
      subject: 'SendGrid 연결 테스트 - TEAMITAKA',
      text: 'SendGrid 연결이 성공했습니다!',
      html: `
        <h1>🎉 SendGrid 연결 성공!</h1>
        <p>TEAMITAKA 백엔드에서 SendGrid를 통해 이메일을 성공적으로 발송했습니다.</p>
        <p>발송 시간: ${new Date().toLocaleString('ko-KR')}</p>
        <p>API: SendGrid Web API</p>
        <p>도메인: teamitaka.com</p>
      `
    };

    // SendGrid로 이메일 발송
    const result = await sendEmailWithSendGrid(mailOptions);
    
    res.json({ 
      success: true, 
      messageId: result[0]?.headers['x-message-id'] || 'N/A',
      message: 'SendGrid 테스트 이메일 발송 성공',
      timestamp: new Date().toISOString(),
      provider: 'SendGrid Web API'
    });
  } catch (error) {
    console.error('SendGrid 테스트 실패:', error);
    res.status(500).json({ 
      error: 'SENDGRID_TEST_FAILED',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
