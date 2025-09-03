const generateVerificationEmail = (code, email) => {
  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TEAMITAKA 이메일 인증</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.7;
          color: #2c3e50;
          max-width: 650px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
          font-size: 16px;
        }
        .container {
          background-color: #ffffff;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border: 1px solid #e9ecef;
        }
        .header {
          text-align: center;
          margin-bottom: 35px;
        }
        .header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #1e3a8a;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .banner {
          width: 100%;
          max-width: 500px;
          height: auto;
          margin: 0 auto 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 10px;
        }
        .verification-code {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border: 3px solid #3b82f6;
          border-radius: 12px;
          padding: 30px 25px;
          text-align: center;
          margin: 35px 0;
          position: relative;
        }
        .verification-code::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #3b82f6, #1e40af, #3b82f6);
          border-radius: 12px;
          z-index: -1;
        }
        .verification-code p {
          font-size: 18px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 15px;
        }
        .code {
          font-size: 48px;
          font-weight: 900;
          color: #1e3a8a;
          letter-spacing: 8px;
          font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Courier New', monospace;
          text-shadow: 0 2px 4px rgba(30, 58, 138, 0.1);
          margin: 5px 0;
        }
        .info {
          background-color: #dbeafe;
          border: 1px solid #93c5fd;
          border-left: 5px solid #3b82f6;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
          font-size: 15px;
        }
        .info strong {
          font-size: 16px;
          color: #1e40af;
          display: block;
          margin-bottom: 8px;
        }
        .warning {
          background-color: #fef3c7;
          border: 1px solid #fcd34d;
          border-left: 5px solid #f59e0b;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
          font-size: 15px;
        }
        .warning strong {
          font-size: 16px;
          color: #d97706;
          display: block;
          margin-bottom: 8px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 25px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="cid:banner" alt="TEAMITAKA 배너" class="banner" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          </div>
          <h2>이메일 인증</h2>
        </div>
        
        <p style="font-size: 17px; color: #374151; margin-bottom: 25px; line-height: 1.6;">안녕하세요! <strong>TEAMITAKA</strong> 회원가입을 위한 이메일 인증번호를 발송드립니다.</p>
        
        <div class="verification-code">
          <p>아래 인증번호를 입력해주세요:</p>
          <div class="code">${code}</div>
        </div>
        
        <div class="info">
          <strong>⚠️ 중요 안내사항</strong><br>
          • 인증번호는 3분 후 자동으로 만료됩니다.<br>
          • 인증번호는 최대 5회까지 시도할 수 있습니다.<br>
          • 본인이 요청하지 않은 경우 이 메일을 무시하세요.
        </div>
        
        <div class="warning">
          <strong>보안을 위해</strong><br>
          • 인증번호를 타인에게 알려주지 마세요.<br>
          • 공용 컴퓨터에서는 로그아웃 후 브라우저를 종료하세요.
        </div>
        
        <p style="font-size: 16px; color: #374151; margin-top: 30px; margin-bottom: 0; line-height: 1.6;">감사합니다.<br><strong style="color: #1e40af;">TEAMITAKA 팀 드림</strong></p>
        
        <div class="footer">
          <p>본 메일은 ${email}로 발송되었습니다.</p>
          <p>© 2025 TEAMITAKA. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateVerificationEmailText = (code) => {
  return `
TEAMITAKA 이메일 인증

안녕하세요! TEAMITAKA 회원가입을 위한 이메일 인증번호를 발송드립니다.

인증번호: ${code}

⚠️ 중요 안내사항
• 인증번호는 3분 후 자동으로 만료됩니다.
• 인증번호는 최대 5회까지 시도할 수 있습니다.
• 본인이 요청하지 않은 경우 이 메일을 무시하세요.

보안을 위해
• 인증번호를 타인에게 알려주지 마세요.
• 공용 컴퓨터에서는 로그아웃 후 브라우저를 종료하세요.

감사합니다.
TEAMITAKA 팀 드림

© 2024 TEAMITAKA. All rights reserved.
  `;
};

module.exports = {
  generateVerificationEmail,
  generateVerificationEmailText
};
