require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// SendGrid API 키 설정
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid API 키 설정 완료');
} else {
  console.error('❌ SENDGRID_API_KEY가 설정되지 않았습니다.');
  process.exit(1);
}

// 테스트 이메일 발송
async function testSendGrid() {
  try {
    const msg = {
      to: 'test@example.com', // 실제 테스트할 이메일 주소로 변경하세요
      from: 'noreply@teamitaka.com',
      subject: 'SendGrid 테스트 - TEAMITAKA',
      text: 'SendGrid 연동이 성공했습니다!',
      html: `
        <h1>🎉 SendGrid 연동 성공!</h1>
        <p>TEAMITAKA 백엔드에서 SendGrid를 통해 이메일을 성공적으로 발송했습니다.</p>
        <p>발송 시간: ${new Date().toLocaleString('ko-KR')}</p>
        <p>API: SendGrid Web API</p>
        <p>도메인: teamitaka.com</p>
      `
    };

    console.log('📧 이메일 발송 시도...');
    const result = await sgMail.send(msg);
    
    console.log('✅ 이메일 발송 성공!');
    console.log('Message ID:', result[0]?.headers['x-message-id'] || 'N/A');
    console.log('Status Code:', result[0]?.statusCode || 'N/A');
    
  } catch (error) {
    console.error('❌ 이메일 발송 실패:', error.message);
    
    if (error.response) {
      console.error('응답 상세:', error.response.body);
    }
  }
}

// 테스트 실행
testSendGrid();
