# 🏢 TEAMITAKA Backend API

> 대학생 프로젝트 매칭 플랫폼의 백엔드 서비스

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21.2-blue)](https://expressjs.com/)
[![MariaDB](https://img.shields.io/badge/MariaDB-3.4.0-orange)](https://mariadb.org/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.37.5-brightgreen)](https://sequelize.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시스템 아키텍처](#-시스템-아키텍처)
- [설치 및 실행](#-설치-및-실행)
- [API 문서](#-api-문서)
- [데이터베이스 구조](#-데이터베이스-구조)
- [환경 설정](#-환경-설정)
- [배포](#-배포)
- [테스트](#-테스트)
- [개발 가이드](#-개발-가이드)
- [문제 해결](#-문제-해결)
- [기여하기](#-기여하기)

## 🚀 프로젝트 개요

**TEAMITAKA Backend**는 대학생들이 프로젝트 팀을 매칭하고 협업할 수 있는 플랫폼의 서버 사이드 애플리케이션입니다.

### 🔗 배포 현황
- **프로덕션**: https://teamitaka-backend-zwe2nuc5ga-uc.a.run.app
- **상태**: ✅ **완전히 정상 작동**
- **데이터베이스**: 🟢 **연결 성공**
- **Health Check**: ✅ **정상**
- **JWT 인증**: ✅ **정상 작동**

### 핵심 가치
- 🎯 **효율적인 팀 매칭**: 스킬과 관심사 기반 팀원 모집
- 🔒 **안전한 인증 시스템**: JWT 토큰과 이메일 인증으로 보안 강화
- 📱 **확장 가능한 아키텍처**: 마이크로서비스 패턴으로 설계
- 🌍 **글로벌 호환성**: 다국어 및 다양한 대학 지원

## ✨ 주요 기능

### 🔐 인증 및 사용자 관리
- **회원가입/로그인**: JWT 기반 인증 시스템
- **이메일 인증**: SendGrid를 통한 안전한 계정 확인
- **Google 소셜 로그인**: ID 토큰 검증 방식
- **비밀번호 보안**: bcrypt를 이용한 안전한 암호화
- **자동 사용자명 생성**: 이메일 기반 고유 사용자명 생성

### 👥 프로젝트 매칭
- **모집공고 관리**: 프로젝트별 팀원 모집
- **지원 시스템**: 관심 있는 프로젝트에 지원
- **프로필 관리**: 스킬, 포트폴리오, 수상 경력 관리
- **리뷰 시스템**: 팀 협업 후 상호 피드백

### 📊 커뮤니티 기능
- **댓글 시스템**: 프로젝트별 소통 기능
- **스크랩 기능**: 관심 프로젝트 북마크
- **검색 기능**: 다양한 조건으로 프로젝트 검색
- **알림 시스템**: 실시간 상태 업데이트

### 🛠 관리자 기능
- **사용자 관리**: 회원 정보 및 권한 관리
- **콘텐츠 모니터링**: 부적절한 내용 필터링
- **시스템 모니터링**: 서버 상태 및 성능 관리

## 🔧 기술 스택

### Backend Framework
- **Node.js 18.x**: 서버 사이드 JavaScript 런타임
- **Express.js 4.21.2**: 웹 애플리케이션 프레임워크
- **Sequelize 6.37.5**: ORM (Object-Relational Mapping)

### Database
- **MariaDB 3.4.0**: 메인 데이터베이스
- **MySQL2**: 데이터베이스 커넥터

### Authentication & Security
- **JWT (jsonwebtoken)**: 토큰 기반 인증
- **bcrypt/bcryptjs**: 비밀번호 암호화
- **Google ID Token**: 소셜 로그인
- **Rate Limiting**: API 호출 제한
- **CORS**: 교차 출처 리소스 공유 설정

### External Services
- **SendGrid**: 이메일 발송 서비스
- **Google Cloud Platform**: 배포 및 데이터베이스 호스팅

### Development & Testing
- **Jest**: 테스트 프레임워크
- **Supertest**: API 테스트
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **Nodemon**: 개발 서버 자동 재시작

### DevOps & Deployment
- **Docker**: 컨테이너화
- **Docker Compose**: 다중 컨테이너 관리
- **GitHub Actions**: CI/CD 파이프라인
- **Google Cloud Run**: 서버리스 배포

### Logging & Monitoring
- **Winston**: 구조화된 로깅
- **Morgan**: HTTP 요청 로깅

## 🏗 시스템 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (Express)     │◄──►│   (MariaDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ External APIs   │
                    │ - SendGrid      │
                    │ - Google Auth   │
                    └─────────────────┘
```

### 디렉터리 구조

```
teamitakaBackend/
├── src/                          # 소스 코드
│   ├── config/                   # 설정 파일
│   │   ├── db.js                # 데이터베이스 설정
│   │   ├── emailConfig.js       # 이메일 서비스 설정
│   │   └── authConfig.js        # 인증 설정
│   ├── controllers/              # 비즈니스 로직 컨트롤러
│   │   ├── authController.js    # 인증 관련 로직
│   │   ├── userController.js    # 사용자 관리
│   │   ├── projectController.js # 프로젝트 관리
│   │   └── ...
│   ├── middlewares/              # 미들웨어
│   │   ├── authMiddleware.js    # 인증 검증
│   │   ├── rateLimitMiddleware.js # API 제한
│   │   └── validationMiddleware.js # 데이터 검증
│   ├── models/                   # 데이터 모델
│   │   ├── User.js              # 사용자 모델
│   │   ├── Project.js           # 프로젝트 모델
│   │   ├── Recruitment.js       # 모집공고 모델
│   │   └── ...
│   ├── routes/                   # API 라우트 정의
│   │   ├── authRoutes.js        # 인증 API
│   │   ├── userRoutes.js        # 사용자 API
│   │   ├── projectRoutes.js     # 프로젝트 API
│   │   └── ...
│   ├── utils/                    # 유틸리티 함수
│   │   ├── logger.js            # 로깅 유틸
│   │   ├── usernameGenerator.js # 사용자명 생성
│   │   └── passwordValidator.js # 비밀번호 검증
│   └── migrations/               # 데이터베이스 마이그레이션
├── scripts/                      # 실행 스크립트
│   ├── init-db.js               # 데이터베이스 초기화
│   └── deployment-verification.js # 배포 검증
├── tests/                        # 테스트 파일
├── docs/                         # 문서
├── logs/                         # 로그 파일
├── docker-compose.yml            # Docker Compose 설정
├── Dockerfile                    # Docker 이미지 빌드
├── package.json                  # NPM 패키지 설정
└── swagger.yaml                  # API 문서
```

## 🚀 설치 및 실행

### 📋 사전 요구사항

- **Node.js** 18.x 이상
- **npm** 또는 **yarn**
- **MariaDB** 또는 **MySQL** 5.7 이상
- **Docker** (선택사항)

### 💾 로컬 개발 환경 설정

#### 1. 저장소 클론

```bash
git clone https://github.com/your-org/teamitakaBackend.git
cd teamitakaBackend
```

#### 2. 의존성 설치

```bash
npm install
```

#### 3. 환경 변수 설정

`.env` 파일을 생성하고 다음과 같이 설정:

```env
# 서버 설정
PORT=3000
NODE_ENV=development

# 데이터베이스 설정
DB_HOST=localhost
DB_NAME=teamitaka_database
DB_USER=root
DB_PASSWORD=your_password
DB_CHARSET=utf8mb4

# JWT 시크릿
JWT_SECRET=your-super-secret-jwt-key

# 이메일 서비스 (SendGrid)
EMAIL_SERVICE=sendgrid
EMAIL_FROM=noreply@teamitaka.com
SENDGRID_API_KEY=your-sendgrid-api-key

# 관리자 계정
ADMIN_EMAIL=admin@teamitaka.com
ADMIN_PASSWORD=secure-admin-password
```

#### 4. 데이터베이스 초기화

```bash
# 데이터베이스 생성 및 마이그레이션
npm run db:init

# 또는 단순 초기화
npm run db:init:simple
```

#### 5. 개발 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 🐳 Docker로 실행

#### 개발 환경

```bash
docker-compose up -d
```

#### 프로덕션 환경

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 📊 상태 확인

```bash
# 헬스 체크
curl http://localhost:3000/api/health

# 기본 엔드포인트
curl http://localhost:3000/
```

## 📖 API 문서

### 🔗 Swagger UI
개발 서버 실행 후 다음 주소에서 대화형 API 문서를 확인할 수 있습니다:
- **로컬**: http://localhost:3000/api-docs
- **프로덕션**: https://teamitaka-backend-zwe2nuc5ga-uc.a.run.app/api-docs

### 📋 주요 API 엔드포인트

#### 🔐 인증 (Authentication)

```bash
# 회원가입
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securePassword123"
}

# 로그인
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securePassword123"
}

# 비밀번호 검증
POST /api/auth/validate-password
{
  "password": "currentPassword"
}

# Google 소셜 로그인
POST /api/auth/google/id-token
{
  "idToken": "google_id_token_here"
}
```

#### 👤 사용자 관리

```bash
# 프로필 조회
GET /api/user/profile
Authorization: Bearer <jwt_token>

# 프로필 수정
PUT /api/user/profile
Authorization: Bearer <jwt_token>
{
  "bio": "새로운 자기소개",
  "skills": "JavaScript, Python, React",
  "university": "서울대학교",
  "major": "컴퓨터공학과"
}
```

#### 📊 프로젝트

```bash
# 모집공고 목록 조회
GET /api/recruitments

# 모집공고 상세 조회
GET /api/recruitments/{id}

# 모집공고 생성
POST /api/recruitments
Authorization: Bearer <jwt_token>
{
  "title": "웹 개발 팀원 모집",
  "description": "React를 활용한 프로젝트",
  "required_skills": "JavaScript, React",
  "deadline": "2024-12-31"
}
```

#### 📧 이메일 인증

```bash
# 인증 코드 발송
POST /api/auth/request-verification
{
  "email": "user@example.com"
}

# 인증 코드 검증
POST /api/auth/verify-code
{
  "email": "user@example.com",
  "code": "123456"
}
```

### 📚 API 응답 형식

#### 성공 응답
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": "uuid-here",
      "email": "user@example.com",
      "username": "user123"
    }
  },
  "message": "로그인 성공"
}
```

#### 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "잘못된 이메일 형식입니다",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
```

## 🗄 데이터베이스 구조

### 핵심 테이블

#### 👤 Users (사용자)
```sql
CREATE TABLE Users (
  user_id CHAR(36) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  university VARCHAR(255),
  major VARCHAR(255),
  bio TEXT,
  skills TEXT,
  portfolio_url VARCHAR(255),
  email_verified_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 📋 Projects (프로젝트)
```sql
CREATE TABLE Projects (
  project_id CHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('ACTIVE', 'COMPLETED', 'CANCELLED'),
  leader_id CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (leader_id) REFERENCES Users(user_id)
);
```

#### 📢 Recruitments (모집공고)
```sql
CREATE TABLE Recruitments (
  recruitment_id CHAR(36) PRIMARY KEY,
  project_id CHAR(36),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  required_skills TEXT,
  deadline DATETIME,
  status ENUM('OPEN', 'CLOSED'),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES Projects(project_id)
);
```

### 데이터베이스 관리 명령어

```bash
# 마이그레이션 실행
npm run migrate:dev

# 마이그레이션 롤백
npm run rollback:dev

# 시드 데이터 삽입
npm run seed:dev

# 데이터베이스 초기화
npm run db:reset
```

## ⚙️ 환경 설정

### 환경별 설정 파일

#### 개발 환경 (.env.development)
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_NAME=teamitaka_dev
```

#### 테스트 환경 (.env.test)
```env
NODE_ENV=test
PORT=3001
DB_HOST=localhost
DB_NAME=teamitaka_test
```

#### 프로덕션 환경 (.env.production)
```env
NODE_ENV=production
PORT=8080
DB_HOST=production-db-host
DB_NAME=teamitaka_prod
```

### 🔐 보안 설정

#### JWT 토큰 설정
- **알고리즘**: HS256
- **만료시간**: 24시간 (개발), 1시간 (프로덕션)
- **리프레시 토큰**: 7일

#### Rate Limiting
```javascript
// 일반 API: 100 requests/15분
// 인증 API: 5 requests/15분
// 이메일 인증: 3 requests/15분
```

#### CORS 설정
```javascript
// 개발: localhost:3000, localhost:3001
// 프로덕션: 허용된 도메인만
```

## 🚢 배포

### Google Cloud Run 배포

#### 1. Docker 이미지 빌드

```bash
# 프로덕션 이미지 빌드
docker build -f Dockerfile.prod -t teamitaka-backend .

# Google Container Registry에 푸시
docker tag teamitaka-backend gcr.io/PROJECT_ID/teamitaka-backend
docker push gcr.io/PROJECT_ID/teamitaka-backend
```

#### 2. Cloud Run 배포

```bash
gcloud run deploy teamitaka-backend \
  --image gcr.io/PROJECT_ID/teamitaka-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10
```

#### 3. 환경 변수 설정

```bash
gcloud run services update teamitaka-backend \
  --set-env-vars="NODE_ENV=production,PORT=8080,DB_HOST=cloud-sql-host" \
  --region us-central1
```

### 배포 검증

```bash
# 자동 검증 스크립트 실행
npm run verify:prod

# 수동 헬스 체크
curl https://your-domain.com/api/health
```

## 🧪 테스트

### 테스트 실행

```bash
# 전체 테스트 실행
npm test

# 커버리지 포함 테스트
npm run test:coverage

# 특정 테스트 파일 실행
npm test -- authController.test.js

# 감시 모드로 테스트
npm run test:watch
```

### 테스트 구조

```
tests/
├── unit/                    # 단위 테스트
│   ├── controllers/        # 컨트롤러 테스트
│   ├── models/            # 모델 테스트
│   └── utils/             # 유틸리티 테스트
├── integration/            # 통합 테스트
│   ├── api/               # API 엔드포인트 테스트
│   └── database/          # 데이터베이스 테스트
└── setup/                 # 테스트 설정
    ├── testDb.js          # 테스트 데이터베이스 설정
    └── fixtures.js        # 테스트 데이터
```

### 테스트 커버리지 목표
- **전체**: 90% 이상
- **함수**: 95% 이상
- **라인**: 90% 이상
- **브랜치**: 85% 이상

## 👨‍💻 개발 가이드

### 코딩 스타일

#### ESLint 설정
```javascript
// .eslintrc.json
{
  "extends": ["eslint:recommended", "node"],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "prefer-const": "error"
  }
}
```

#### Prettier 설정
```javascript
// .prettierrc
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Git 워크플로

#### 브랜치 전략
- `main`: 프로덕션 코드
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발
- `hotfix/*`: 긴급 수정
- `release/*`: 릴리스 준비

#### 커밋 메시지 컨벤션
```
type(scope): description

[optional body]

[optional footer]
```

**타입**:
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 스타일 변경
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 기타 작업

## 🔧 문제 해결

### 자주 발생하는 문제들

#### 데이터베이스 연결 오류
```
Error: ER_ACCESS_DENIED_ERROR: Access denied for user 'root'@'localhost'
```

**해결책**:
1. 데이터베이스 사용자 권한 확인
2. `.env` 파일의 DB 설정 검증
3. 데이터베이스 서비스 실행 상태 확인

#### JWT 토큰 검증 실패
```
Error: JsonWebTokenError: invalid token
```

**해결책**:
1. `JWT_SECRET` 환경 변수 확인
2. 토큰 만료 시간 검증
3. 클라이언트의 토큰 형식 확인

#### 이메일 발송 실패
```
Error: Mail service failed to send verification email
```

**해결책**:
1. SendGrid API 키 확인
2. 이메일 주소 형식 검증
3. SendGrid 계정 상태 확인

## 🤝 기여하기

프로젝트 기여를 환영합니다! 다음 단계를 따라주세요:

1. **Fork**: 저장소를 포크합니다
2. **브랜치 생성**: `git checkout -b feature/your-feature-name`
3. **변경 사항 작성**: 코드 작성 및 테스트
4. **커밋**: `git commit -m "feat: add your feature"`
5. **푸시**: `git push origin feature/your-feature-name`
6. **Pull Request**: PR을 생성하고 리뷰를 요청합니다

## 📚 추가 리소스

### 관련 문서
- [API_TEST_GUIDE.md](./API_TEST_GUIDE.md): API 테스트 상세 가이드
- [EMAIL_VERIFICATION_IMPLEMENTATION.md](./EMAIL_VERIFICATION_IMPLEMENTATION.md): 이메일 인증 구현 가이드
- [swagger.yaml](./swagger.yaml): OpenAPI 명세서

### 유용한 링크
- [Express.js 공식 문서](https://expressjs.com/)
- [Sequelize 공식 문서](https://sequelize.org/)
- [JWT.io](https://jwt.io/): JWT 토큰 디버깅
- [SendGrid 문서](https://docs.sendgrid.com/)
- [Google Identity Platform](https://cloud.google.com/identity-platform)

## 📄 라이센스

이 프로젝트는 [MIT 라이센스](LICENSE)를 따릅니다.

---

## 👥 팀

### 핵심 개발팀
- **백엔드 개발**: TEAMITAKA 개발팀
- **DevOps**: 인프라 관리팀
- **QA**: 품질 보증팀

### 연락처
- **이메일**: dev@teamitaka.com
- **GitHub**: [@teamitaka](https://github.com/teamitaka)

---

<div align="center">
  <p>💡 <strong>TEAMITAKA Backend</strong>로 더 나은 팀 협업을 경험해보세요!</p>
  <p>🌟 프로젝트가 도움이 되셨다면 Star를 눌러주세요!</p>
</div>