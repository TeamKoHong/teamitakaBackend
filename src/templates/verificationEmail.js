const generateVerificationEmail = (code, email) => {
  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>티미타카 이메일 인증</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Malgun Gothic', '맑은 고딕', sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .email-wrapper {
          width: 100%;
          background: linear-gradient(135deg, #FFD89B 0%, #FFB88C 50%, #FFAB76 100%);
          padding: 40px 20px;
        }
        .email-container {
          max-width: 500px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        .header-content {
          flex: 1;
        }
        .brand-name {
          font-size: 28px;
          font-weight: 700;
          color: #8B4513;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .mascot {
          width: 120px;
          height: auto;
          margin-left: 20px;
        }
        .welcome-text {
          font-size: 16px;
          color: #5D4037;
          margin: 15px 0 0 0;
          line-height: 1.7;
        }
        .verification-box {
          background-color: #FFFFFF;
          border-radius: 16px;
          padding: 40px 30px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          margin: 25px 0;
        }
        .verification-label {
          font-size: 16px;
          font-weight: 600;
          color: #666666;
          margin-bottom: 20px;
        }
        .verification-code {
          font-size: 42px;
          font-weight: 800;
          color: #333333;
          letter-spacing: 8px;
          font-family: 'SF Mono', 'Monaco', 'Menlo', 'Courier New', monospace;
          margin: 10px 0;
        }
        .info-text {
          font-size: 14px;
          color: #8B7355;
          margin-top: 20px;
          line-height: 1.6;
        }
        .info-text ul {
          list-style: none;
          padding: 0;
          margin: 10px 0 0 0;
        }
        .info-text li {
          margin: 5px 0;
        }
        .info-text li::before {
          content: "•";
          color: #FFB88C;
          font-weight: bold;
          margin-right: 8px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          color: #8B7355;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-container">
          <div class="header">
            <div class="header-content">
              <h1 class="brand-name">티미타카</h1>
              <p class="welcome-text">
                안녕하세요, 티미타카 가입을 진행해주셔서 감사합니다.<br>
                아래 인증번호를 입력하면 바로 서비스 이용을 시작할 수 있어요.
              </p>
            </div>
            <img src="https://huwajjafqbfrcxkdfker.supabase.co/storage/v1/object/public/email-assets/character.png" alt="티미타카 마스코트" class="mascot">
          </div>

          <div class="verification-box">
            <div class="verification-label">인증번호</div>
            <div class="verification-code">${code}</div>
          </div>

          <div class="info-text">
            <ul>
              <li>인증번호는 3분 후 만료됩니다</li>
              <li>본인이 요청하지 않은 경우 이 메일을 무시하세요</li>
            </ul>
          </div>

          <div class="footer">
            <p>본 메일은 ${email}로 발송되었습니다.</p>
            <p>© 2025 티미타카. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateVerificationEmailText = (code) => {
  return `
티미타카 이메일 인증

안녕하세요, 티미타카 가입을 진행해주셔서 감사합니다.
아래 인증번호를 입력하면 바로 서비스 이용을 시작할 수 있어요.

인증번호: ${code}

• 인증번호는 3분 후 만료됩니다
• 본인이 요청하지 않은 경우 이 메일을 무시하세요

© 2025 티미타카. All rights reserved.
  `;
};

module.exports = {
  generateVerificationEmail,
  generateVerificationEmailText
};
