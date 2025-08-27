# TEAMITAKA Backend

TEAMITAKA 백엔드 API 서버입니다.

## 🚀 배포 상태

- **프로덕션**: https://teamitaka-backend-zwe2nuc5ga-uc.a.run.app
- **상태**: ✅ **완전히 정상 작동**
- **데이터베이스**: 🟢 **연결 성공**
- **Health Check**: ✅ **정상**
- **JWT 인증**: ✅ **정상 작동**

### 🏥 Health Check
- **엔드포인트**: `/health`
- **상태**: `{"status":"OK","database":"connected"}`
- **URL**: https://teamitaka-backend-zwe2nuc5ga-uc.a.run.app/health

## 📚 API 문서

### Swagger UI
- **프로덕션**: https://teamitaka-backend-zwe2nuc5ga-uc.a.run.app/api-docs
- **로컬**: http://localhost:3000/api-docs

### JSON 형식
- **프로덕션**: https://teamitaka-backend-zwe2nuc5ga-uc.a.run.app/api-docs/swagger.json
- **로컬**: http://localhost:3000/api-docs/swagger.json

### ✅ 최근 수정사항 (2025년 6월 23일)
- **스키마 오류 수정**: 누락된 `Project`, `Application`, `User` 등 스키마 추가
- **서버 URL 수정**: `/api` 접두사 추가로 실제 라우트와 일치
- **API 경로 수정**: `/recruitment` → `/recruitments`, `/users` → `/user` 등 실제 라우트와 일치
- **누락된 스키마 추가**: `RecruitmentDraft`, `Comment`, `ProjectMember`, `Rating`, `Timeline`, `Todo` 스키마 추가
- **API 엔드포인트 정상화**: 모든 API가 정상적으로 작동

## 🔧 기술 스택

- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Database**: MySQL (Cloud SQL)
- **ORM**: Sequelize
- **Authentication**: JWT (기본값 지원)
- **Deployment**: Google Cloud Run
- **Container**: Docker
- **CI/CD**: GitHub Actions
- **API Documentation**: Swagger/OpenAPI 3.0

## 🏗️ 프로젝트 구조

```
src/
├── config/          # 설정 파일 (DB, 환경변수 등)
├── models/          # Sequelize 모델
├── routes/          # API 라우트
├── middleware/      # 미들웨어
└── app.js          # 메인 애플리케이션 파일
```

## 🎯 빠른 시작

### 1. API 문서 확인
- Swagger UI: https://teamitaka-backend-zwe2nuc5ga-uc.a.run.app/api-docs

### 2. 서버 상태 확인
- Health Check: https://teamitaka-backend-zwe2nuc5ga-uc.a.run.app/health

### 3. 기본 엔드포인트
- 메인 페이지: https://teamitaka-backend-zwe2nuc5ga-uc.a.run.app/

## 🚀 주요 기능

### 1. 인증 시스템
- 사용자 로그인/회원가입
- JWT 토큰 기반 인증
- **자체 이메일 인증 시스템** (UnivCert 대체)
  - Nodemailer 기반 이메일 발송
  - 보안 강화된 인증번호 관리
  - 속도 제한 및 시도 횟수 제한

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
# ===== 서버 설정 =====
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000

# ===== 데이터베이스 설정 =====
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
DB_PORT=3306
JWT_SECRET=your_jwt_secret  # 선택사항 (기본값 제공)

# ===== 이메일 서비스 설정 =====
# SendGrid 사용 시 (권장)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=sg.your_sendgrid_api_key_here
EMAIL_FROM=noreply@teamitaka.com

# Gmail 사용 시
# EMAIL_SERVICE=gmail
# EMAIL_USER=your-email@gmail.com
# EMAIL_APP_PASSWORD=your-gmail-app-password
```

### 3. 데이터베이스 초기화
```bash
# 개발 환경 (테이블 생성 + 시드 데이터)
npm run db:init:dev

# 프로덕션 환경 (테이블 생성만)
npm run db:init:prod

# DB 리셋 (개발용)
npm run db:reset
```

### 4. 서버 실행
```bash
npm run dev
```

## 🗄️ 데이터베이스 관리

### 자동 초기화
- **개발 환경**: 테이블 생성 + 테스트 데이터 자동 생성
- **프로덕션 환경**: 안전한 테이블 동기화만 수행
- **CI/CD**: 배포 시 자동으로 DB 초기화

### 시드 데이터
다음 테스트 데이터가 자동으로 생성됩니다:
- **테스트 사용자**: `test@example.com` / `password`
- **테스트 모집공고**: "테스트 모집공고"
- **테스트 프로젝트**: "테스트 프로젝트"
- **테스트 댓글, 지원, 리뷰** 등

### 수동 DB 관리
```bash
# Sequelize CLI 사용
npm run migrate:dev      # 마이그레이션 실행
npm run seed:dev         # 시드 데이터 생성
npm run rollback:dev     # 마이그레이션 롤백
```

## 📦 배포

### 자동 배포 (GitHub Actions)
- `dev` 브랜치에 푸시하면 자동으로 배포됩니다
- 배포 상태는 GitHub Actions에서 확인 가능
- **최신 배포**: ✅ 성공 (2024년 6월 23일)
- **Health Check**: ✅ 통과

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