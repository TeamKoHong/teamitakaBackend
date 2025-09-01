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
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
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
          background-color: #f8f9fa;
          border: 2px dashed #007bff;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 30px 0;
        }
        .code {
          font-size: 36px;
          font-weight: bold;
          color: #007bff;
          letter-spacing: 5px;
          font-family: 'Courier New', monospace;
        }
        .info {
          background-color: #e7f3ff;
          border-left: 4px solid #007bff;
          padding: 15px;
          margin: 20px 0;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 12px;
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
        
        <p>안녕하세요! TEAMITAKA 회원가입을 위한 이메일 인증번호를 발송드립니다.</p>
        
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
        
        <p>감사합니다.<br>TEAMITAKA 팀 드림</p>
        
        <div class="footer">
          <p>본 메일은 ${email}로 발송되었습니다.</p>
          <p>© 2024 TEAMITAKA. All rights reserved.</p>
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
