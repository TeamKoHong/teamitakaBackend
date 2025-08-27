const request = require('supertest');
const app = require('../src/app');

describe('Email Verification API', () => {
  describe('POST /api/auth/send-verification', () => {
    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/send-verification')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toBe('입력값 검증에 실패했습니다.');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/send-verification')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toBe('입력값 검증에 실패했습니다.');
    });
  });

  describe('POST /api/auth/verify-code', () => {
    it('should return 400 for invalid code format', async () => {
      const response = await request(app)
        .post('/api/auth/verify-code')
        .send({ 
          email: 'test@korea.ac.kr', 
          code: '12345' // 5자리
        })
        .expect(400);

      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toBe('입력값 검증에 실패했습니다.');
    });

    it('should return 400 for missing parameters', async () => {
      const response = await request(app)
        .post('/api/auth/verify-code')
        .send({ email: 'test@korea.ac.kr' })
        .expect(400);

      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toBe('입력값 검증에 실패했습니다.');
    });
  });

  describe('GET /api/auth/status', () => {
    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .get('/api/auth/status')
        .expect(400);

      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toBe('입력값 검증에 실패했습니다.');
    });
  });
});
