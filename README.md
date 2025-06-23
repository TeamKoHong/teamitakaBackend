# Teamitaka Backend

Teamitaka 백엔드 API 서버입니다.

## 🚀 배포 상태

- **프로덕션**: https://teamitaka-backend-zwe2nuc5ga-uc.a.run.app
- **상태**: ✅ 배포 완료 (DB 연결 필요)

## 📚 API 문서

### Swagger UI
- **프로덕션**: https://teamitaka-backend-zwe2nuc5ga-uc.a.run.app/api-docs
- **로컬**: http://localhost:3000/api-docs

### JSON 형식
- **프로덕션**: https://teamitaka-backend-zwe2nuc5ga-uc.a.run.app/api-docs/swagger.json
- **로컬**: http://localhost:3000/api-docs/swagger.json

## 🔧 기술 스택

- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Database**: MySQL (Cloud SQL)
- **ORM**: Sequelize
- **Authentication**: JWT
- **Deployment**: Google Cloud Run
- **Container**: Docker
- **CI/CD**: GitHub Actions

## 🏗️ 프로젝트 구조

```
src/
├── config/          # 설정 파일 (DB, 환경변수 등)
├── models/          # Sequelize 모델
├── routes/          # API 라우트
├── middleware/      # 미들웨어
└── app.js          # 메인 애플리케이션 파일
```

## 🚀 주요 기능

### 1. 인증 시스템
- 사용자 로그인/회원가입
- JWT 토큰 기반 인증
- 대학 인증 시스템 (UnivCert)

### 2. 모집공고 관리
- 모집공고 작성/수정/삭제
- 지원 및 승인/거절 시스템
- 댓글 시스템

### 3. 프로젝트 관리
- 프로젝트 생성/관리
- 팀원 관리
- 할 일 및 타임라인

### 4. 리뷰 시스템
- 팀원 간 상호 리뷰
- 평점 시스템 (능력, 노력, 헌신, 소통, 성찰)

## 🔐 인증 방법

대부분의 API는 JWT 토큰이 필요합니다.

```javascript
// 로그인 후 받은 토큰을 모든 API 요청에 포함
const headers = {
  'Authorization': 'Bearer <your-jwt-token>',
  'Content-Type': 'application/json'
};
```

## 🛠️ 개발 환경 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
`.env` 파일을 생성하고 다음 변수들을 설정:

```env
NODE_ENV=development
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
DB_PORT=3306
JWT_SECRET=your_jwt_secret
```

### 3. 데이터베이스 마이그레이션
```bash
npm run migrate:dev
```

### 4. 서버 실행
```bash
npm run dev
```

## 📦 배포

### 자동 배포 (GitHub Actions)
- `dev` 브랜치에 푸시하면 자동으로 배포됩니다
- 배포 상태는 GitHub Actions에서 확인 가능

### 수동 배포
```bash
# Docker 이미지 빌드
docker build -f Dockerfile.prod -t teamitaka-backend .

# Cloud Run에 배포
gcloud run deploy teamitaka-backend \
  --image teamitaka-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 🔍 API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입

### 모집공고
- `GET /api/recruitments` - 모집공고 목록
- `POST /api/recruitments` - 모집공고 작성
- `GET /api/recruitments/:id` - 모집공고 상세

### 프로젝트
- `GET /api/projects` - 프로젝트 목록
- `POST /api/projects` - 프로젝트 생성
- `GET /api/projects/:id` - 프로젝트 상세

### 지원
- `POST /api/applications/:recruitment_id` - 지원하기
- `GET /api/applications/:recruitment_id` - 지원자 목록

## 📞 연락처

프로젝트 관련 문의사항이 있으시면 개발팀에 연락해 주세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 