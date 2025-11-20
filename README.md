# 🚀 TeamItaka Backend

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

팀 프로젝트 모집 및 협업을 위한 종합 RESTful API 서비스

> [English](README.en.md) | **한국어**

## 📋 목차

- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
- [프로젝트 구조](#-프로젝트-구조)
- [API 문서](#-api-문서)
- [데이터베이스](#-데이터베이스)
- [개발 가이드](#-개발-가이드)
- [테스트](#-테스트)
- [배포](#-배포)
- [환경 변수](#-환경-변수)
- [기여하기](#-기여하기)

## ✨ 주요 기능

### 🔐 사용자 인증 및 권한 관리
- 6자리 인증 코드를 통한 이메일 인증 (SendGrid Web API)
- 도메인 인증 완료 (teamitaka.com)
- JWT 기반 인증 시스템
- 구글 OAuth 소셜 로그인
- bcrypt 기반 안전한 비밀번호 암호화
- Rate Limiting 적용 (중복 요청 방지)

### 📊 프로젝트 관리
- 프로젝트 생성, 조회, 수정, 삭제 (CRUD)
- 내 프로젝트 조회 (평가 상태 추적)
- 팀원 모집 시스템 (이미지 업로드 지원)
- 지원서 제출 및 추적 관리
  - 자기소개 작성 (1-500자)
  - 포트폴리오 프로젝트 연결
  - 본인 모집글 지원 방지
- 팀 멤버 관리
- 팀원 상호 평가 시스템

### 📈 대시보드
- 프로젝트 통계 (참여 프로젝트 수, 모집공고 수)
- 지원서 및 알림 추적
- 평가 대기 프로젝트 확인
- 최근 활동 타임라인

### 👤 사용자 프로필
- 커스터마이징 가능한 프로필
- 기술 스택 및 경력 관리
- 포트폴리오 관리

### 💬 소셜 기능
- 댓글 및 답글
- 프로젝트 리뷰 및 평점
- 북마크/스크랩 기능
- 투표 시스템

### 🔍 검색 및 탐색
- 고급 프로젝트 검색
- 기술 스택, 역할, 상태별 필터링
- 사용자 검색

### 🖼️ 파일 업로드
- 모집공고 이미지 업로드 (Supabase Storage)
- 이미지 파일 검증 (jpeg, png, webp)
- 파일 크기 제한 (최대 5MB)
- UUID 기반 파일명 생성

### 🛡️ 관리자 기능
- 사용자 관리
- 콘텐츠 관리
- 시스템 모니터링

## 🛠 기술 스택

### 핵심 기술
- **런타임**: Node.js 18+
- **프레임워크**: Express.js
- **데이터베이스**: MySQL / PostgreSQL (Supabase)
- **ORM**: Sequelize (마이그레이션) + Raw SQL (프로덕션 쿼리)
  - PostgreSQL snake_case 명명 규칙 (project_members, created_at 등)

### 인증 및 보안
- **JWT**: jsonwebtoken, jose
- **비밀번호 암호화**: bcrypt, bcryptjs
- **유효성 검증**: Joi, express-validator
- **Rate Limiting**: express-rate-limit
- **CORS**: cors

### 이메일 및 통신
- **이메일 서비스**: SendGrid Web API (도메인 인증 완료)
- **템플릿 엔진**: markdown-it, marked

### 개발 및 테스트
- **테스팅**: Jest, Supertest
- **코드 품질**: ESLint, Prettier
- **프로세스 관리**: nodemon
- **환경 변수**: dotenv, cross-env

### 파일 및 스토리지
- **파일 업로드**: multer
- **파일 저장소**: Supabase Storage
- **파일명 생성**: uuid

### 클라우드 및 배포
- **호스팅**: Render (프로덕션)
- **데이터베이스**: Supabase PostgreSQL (Shared Pooler)
- **스토리지**: Supabase Storage (이미지 업로드)
- **이메일**: SendGrid (도메인 인증 완료)
- **버전 관리**: GitHub

## 🚀 시작하기

### 사전 요구사항

- Node.js >= 18.0.0
- npm 또는 yarn
- MySQL 8.0+ 또는 PostgreSQL 14+
- Git

### 설치 방법

#### 1️⃣ 저장소 복제

```bash
git clone https://github.com/TeamKoHong/teamitakaBackend.git
cd teamitakaBackend
```

#### 2️⃣ 의존성 패키지 설치

```bash
npm install
```

#### 3️⃣ 환경 변수 설정

```bash
# 예제 환경 파일 복사
cp .env.example .env.development

# 환경 변수 파일 수정
nano .env.development
```

#### 4️⃣ 데이터베이스 초기화

```bash
# 마이그레이션 실행
npm run migrate:dev

# 초기 데이터 시딩 (선택사항)
npm run seed:dev
```

#### 5️⃣ 개발 서버 시작

```bash
npm run dev
```

서버가 `http://0.0.0.0:8080` 에서 시작됩니다.

### 🐳 Docker로 빠르게 시작하기

```bash
# Docker Compose 사용
docker-compose up -d
```

## 📁 프로젝트 구조

```
teamitakaBackend/
├── src/
│   ├── config/          # 설정 파일 (DB, env)
│   ├── controllers/     # 라우트 컨트롤러
│   ├── middlewares/     # Express 미들웨어 (인증, 검증)
│   ├── models/          # Sequelize 모델
│   ├── routes/          # API 라우트
│   ├── services/        # 비즈니스 로직 레이어
│   ├── utils/           # 유틸리티 함수
│   ├── validations/     # 요청 유효성 검증 스키마
│   ├── templates/       # 이메일 템플릿
│   └── app.js           # Express 앱 설정
├── tests/               # 테스트 파일
├── scripts/             # 유틸리티 스크립트
├── migrations/          # 데이터베이스 마이그레이션
├── docs/                # 문서
├── index.js             # 애플리케이션 진입점
└── package.json         # 의존성 및 스크립트
```

## 📚 API 문서

### 기본 URL
- **개발 환경**: `http://localhost:8080`
- **프로덕션**: `https://teamitakabackend.onrender.com`

### 주요 엔드포인트

#### 🔐 인증 (Authentication)
```
POST   /api/auth/register              # 회원가입
POST   /api/auth/login                 # 로그인
GET    /api/auth/me                    # 현재 사용자 정보 조회
POST   /api/auth/logout                # 로그아웃
POST   /api/auth/send-verification     # 이메일 인증 코드 전송
POST   /api/auth/verify-code           # 이메일 인증 코드 확인
GET    /api/auth/google                # 구글 OAuth 로그인
```

#### 👤 사용자 (Users)
```
GET    /api/users/:id                  # 사용자 프로필 조회
PUT    /api/users/:id                  # 사용자 프로필 수정
DELETE /api/users/:id                  # 사용자 계정 삭제
```

#### 📊 프로젝트 (Projects)
```
GET    /api/projects                   # 전체 프로젝트 목록
GET    /api/projects/mine              # 내 프로젝트 조회 (evaluation_status 지원)
GET    /api/projects/:id               # 프로젝트 상세 조회
POST   /api/projects                   # 새 프로젝트 생성
PUT    /api/projects/:id               # 프로젝트 수정
DELETE /api/projects/:id               # 프로젝트 삭제
```

#### 🏷️ 모집공고 (Recruitments)
```
POST   /api/recruitments               # 모집공고 생성 (해시태그 지원)
GET    /api/recruitments/:id           # 모집공고 상세 조회 (Hashtags 배열 포함)
```

#### 📝 지원서 (Applications)
```
POST   /api/applications/:recruitment_id          # 지원서 제출 (자기소개 + 포트폴리오)
GET    /api/applications/:recruitment_id          # 지원자 목록 (포트폴리오 포함)
POST   /api/applications/:application_id/approve  # 지원 승인
POST   /api/applications/:application_id/reject   # 지원 거절
GET    /api/applications/:recruitment_id/count    # 지원자 수 조회
```

#### 📤 파일 업로드 (Upload)
```
POST   /api/upload/recruitment-image   # 모집공고 이미지 업로드 (JWT 필수)
```

#### 💬 댓글 (Comments)
```
GET    /api/comments/:projectId        # 프로젝트 댓글 조회
POST   /api/comments                   # 댓글 작성
PUT    /api/comments/:id               # 댓글 수정
DELETE /api/comments/:id               # 댓글 삭제
```

#### 🔍 검색 (Search)
```
GET    /api/search/projects            # 프로젝트 검색
GET    /api/search/users               # 사용자 검색
```

#### 📈 대시보드 (Dashboard)
```
GET    /api/dashboard/summary          # 대시보드 요약 정보
```

#### 🛡️ 관리자 (Admin)
```
GET    /api/admin/users                # 전체 사용자 목록
PUT    /api/admin/users/:id/role       # 사용자 역할 수정
DELETE /api/admin/users/:id            # 사용자 삭제 (관리자)
```

#### ❤️ 상태 확인 (Health Check)
```
GET    /api/health                     # 서버 상태 확인
```

자세한 API 문서는 [API_DOCS.md](docs/API_DOCS.md)를 참고하세요.

## 🗄 데이터베이스

### 지원 데이터베이스
- **MySQL 8.0+** (로컬 개발)
- **PostgreSQL 14+** (Supabase 프로덕션)

### 데이터베이스 모델

| 모델 | 설명 |
|------|------|
| **Users** | 사용자 계정 및 프로필 |
| **Projects** | 프로젝트 정보 |
| **ProjectMembers** | 프로젝트 팀 멤버 |
| **Recruitments** | 프로젝트 모집 공고 (이미지 지원, 해시태그 지원) |
| **Applications** | 프로젝트 지원서 (자기소개 + 포트폴리오) |
| **ApplicationPortfolios** | 지원서-포트폴리오 연결 (M:N 관계) |
| **Hashtags** | 해시태그 태그 관리 |
| **recruitment_hashtags** | 모집공고-해시태그 연결 (M:N 관계) |
| **Comments** | 프로젝트 댓글 |
| **Reviews** | 프로젝트 리뷰 및 팀원 평가 |
| **Notifications** | 사용자 알림 |
| **Scraps** | 북마크한 프로젝트 |
| **Votes** | 투표 시스템 |
| **EmailVerifications** | 이메일 인증 코드 |

### 마이그레이션

```bash
# 마이그레이션 실행
npm run migrate:dev          # 개발 환경
npm run migrate:prod         # 프로덕션 환경

# 마이그레이션 롤백
npm run rollback:dev         # 마지막 마이그레이션 롤백
npm run undo-migrate:dev     # 모든 마이그레이션 롤백

# 데이터 시딩
npm run seed:dev             # 개발 데이터 시딩
```

### 데이터베이스 초기화

```bash
# 모든 테이블을 포함한 데이터베이스 초기화
npm run db:init:dev

# 간단한 초기화
npm run db:init:simple:dev

# 데이터베이스 리셋
npm run db:reset
```

## 🔧 개발 가이드

### 사용 가능한 스크립트

```bash
# 개발
npm run dev                  # nodemon으로 시작 (핫 리로드)
npm run dev:supabase        # Supabase 설정으로 시작

# 프로덕션
npm start                    # 프로덕션 서버 시작
npm run start:supabase      # Supabase 설정으로 프로덕션 시작

# 테스트
npm test                     # 모든 테스트 실행
npm run test:watch          # 워치 모드로 테스트 실행

# 코드 품질
npm run lint                 # ESLint 및 Prettier 실행

# 데이터베이스
npm run migrate:dev         # 마이그레이션 실행
npm run seed:dev            # 데이터베이스 시딩
npm run db:init:dev         # 데이터베이스 초기화

# 검증
npm run verify              # 배포 검증
npm run verify:supabase     # Supabase 배포 검증
```

### 개발 워크플로우

#### 1️⃣ 새 브랜치 생성

```bash
git checkout -b feature/기능-이름
```

#### 2️⃣ 변경 사항 작성

```bash
# 파일 수정
# 테스트 작성
```

#### 3️⃣ 테스트 실행

```bash
npm test
```

#### 4️⃣ 변경 사항 커밋

```bash
git add .
git commit -m "feat: 기능 설명"
```

#### 5️⃣ 원격 저장소에 푸시

```bash
git push origin feature/기능-이름
```

#### 6️⃣ Pull Request 생성

GitHub에서 Pull Request를 생성합니다.

### 코드 스타일

이 프로젝트는 ESLint와 Prettier를 사용합니다:

```bash
# 린터 실행
npm run lint

# 자동 수정
npm run lint -- --fix
```

## 🧪 테스트

### 테스트 실행

```bash
# 모든 테스트 실행
npm test

# 커버리지와 함께 테스트 실행
npm test -- --coverage

# 특정 테스트 파일 실행
npm test -- tests/auth.test.js

# 워치 모드
npm test -- --watch
```

### 테스트 구조

```javascript
describe('인증 컨트롤러', () => {
  it('새 사용자를 등록해야 함', async () => {
    // 테스트 구현
  });

  it('유효한 자격 증명으로 로그인해야 함', async () => {
    // 테스트 구현
  });
});
```

### 커버리지 리포트

커버리지 리포트는 `coverage/` 디렉토리에 생성됩니다.

## 🚀 배포

### Render 배포

이 프로젝트는 Render에 배포되어 있습니다:

#### 1️⃣ Render 설정

1. [Render](https://render.com) 계정 생성 및 로그인
2. **New +** → **Web Service** 선택
3. GitHub 저장소 연결
4. 다음 설정 사용:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

#### 2️⃣ 환경 변수 설정

Render 대시보드의 **Environment** 탭에서 필요한 환경 변수 추가:
- `NODE_ENV=production`
- `PORT=3001`
- `SUPABASE_DB_HOST` (Shared Pooler 사용)
- `SUPABASE_DB_PORT=5432`
- `SENDGRID_API_KEY`
- `EMAIL_FROM=noreply@teamitaka.com`
- 기타 필수 환경 변수

#### 3️⃣ 자동 배포

- `main` 브랜치에 푸시하면 자동으로 배포됩니다
- 배포 로그는 Render 대시보드에서 확인 가능

### 환경별 배포

```bash
# 개발 환경
npm run dev

# 프로덕션 (Render)
npm start
```

## 🔐 환경 변수

### 필수 환경 변수

```bash
# Node 환경
NODE_ENV=development                    # development, production, test

# 서버 설정
PORT=8080                              # 서버 포트
HOST=0.0.0.0                          # 서버 호스트 (모든 인터페이스)

# 데이터베이스 (MySQL)
DB_HOST=localhost
DB_USER=데이터베이스_사용자
DB_PASSWORD=데이터베이스_비밀번호
DB_NAME=teamitaka
DB_PORT=3306
DB_DIALECT=mysql

# 데이터베이스 (PostgreSQL/Supabase Direct)
DB_DIALECT=postgres
DB_HOST=db.xxx.supabase.co
DB_USER=postgres
DB_PASSWORD=비밀번호
DB_NAME=postgres
DB_PORT=5432

# Supabase Shared Pooler (프로덕션 권장)
SUPABASE_DB_HOST=aws-0-region.pooler.supabase.com
SUPABASE_DB_USER=postgres.xxx
SUPABASE_DB_PASSWORD=비밀번호
SUPABASE_DB_NAME=postgres
SUPABASE_DB_PORT=5432

# JWT 설정
JWT_SECRET=JWT_시크릿_키
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=리프레시_시크릿
JWT_REFRESH_EXPIRES_IN=30d

# 이메일 서비스 (SendGrid Web API)
EMAIL_SERVICE=sendgrid
EMAIL_FROM=noreply@teamitaka.com      # 도메인 인증 필수
SENDGRID_API_KEY=SendGrid_API_키      # Full Access 권한 필요

# 구글 OAuth
GOOGLE_CLIENT_ID=구글_클라이언트_ID
GOOGLE_CLIENT_SECRET=구글_클라이언트_시크릿
GOOGLE_CALLBACK_URL=http://localhost:8080/api/auth/google/callback

# CORS
CORS_ORIGIN=http://localhost:3000     # 프론트엔드 URL
CORS_CREDENTIALS=true

# Supabase Storage (이미지 업로드)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=익명_키
SUPABASE_STORAGE_BUCKET=버킷명          # 이미지 업로드용 버킷 (예: recruitment-images)
SUPABASE_SERVICE_KEY=서비스_키          # (선택사항)
```

### 환경 파일

- `.env.development` - 개발 환경
- `.env.production` - 프로덕션 환경
- `.env.test` - 테스트 환경
- `env.supabase` - Supabase 설정

**⚠️ 주의**: `.env` 파일은 절대 버전 관리에 커밋하지 마세요!

## 📖 문서

`docs/` 디렉토리에서 추가 문서를 확인할 수 있습니다:

- [API 문서](docs/API_DOCS.md)
- [데이터베이스 스키마](docs/DATABASE_SCHEMA.md)
- [배포 가이드](docs/deployment/DEPLOYMENT_GUIDE.md)
- [로컬 개발 환경 설정](docs/deployment/LOCAL_DEV_SETUP_GUIDE.md)
- [이메일 인증 구현](docs/EmailVerification/IMPLEMENTATION_GUIDE.md)
- [구글 OAuth 구현](docs/GoogleSocialLogin/IMPLEMENTATION_GUIDE.md)
- [SendGrid 도메인 인증 가이드](https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication)

## 🤝 기여하기

기여를 환영합니다! 다음 단계를 따라주세요:

### 기여 프로세스

1. 저장소 포크하기
2. 기능 브랜치 생성 (`git checkout -b feature/멋진-기능`)
3. 변경 사항 커밋 (`git commit -m 'feat: 멋진 기능 추가'`)
4. 브랜치에 푸시 (`git push origin feature/멋진-기능`)
5. Pull Request 열기

### 커밋 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/) 명세를 따릅니다:

| 타입 | 설명 | 예시 |
|------|------|------|
| `feat:` | 새로운 기능 | `feat: 사용자 프로필 추가` |
| `fix:` | 버그 수정 | `fix: 로그인 에러 수정` |
| `docs:` | 문서 변경 | `docs: README 업데이트` |
| `style:` | 코드 포맷팅 | `style: 들여쓰기 수정` |
| `refactor:` | 코드 리팩토링 | `refactor: 인증 로직 개선` |
| `test:` | 테스트 추가/수정 | `test: 회원가입 테스트 추가` |
| `chore:` | 기타 변경사항 | `chore: 의존성 업데이트` |

### 코드 리뷰

- 모든 Pull Request는 리뷰를 거칩니다
- 테스트를 통과해야 합니다
- 코드 스타일 가이드를 따라야 합니다

## 📝 라이선스

이 프로젝트는 ISC 라이선스를 따릅니다.

## 👥 팀

**TeamItaka 개발팀**

- 백엔드 개발
- API 설계
- 데이터베이스 아키텍처
- DevOps 및 배포

## 🐛 버그 리포트 및 기능 요청

버그 리포트와 기능 요청은 [GitHub Issues](https://github.com/TeamKoHong/teamitakaBackend/issues)를 이용해 주세요.

### 버그 리포트 작성 시 포함할 내용

- 버그 설명
- 재현 단계
- 예상 동작
- 실제 동작
- 스크린샷 (필요시)
- 환경 정보 (OS, Node.js 버전 등)

### 기능 요청 작성 시 포함할 내용

- 기능 설명
- 사용 사례
- 예상되는 이점
- 추가 컨텍스트

## 📮 연락처

질문이나 지원이 필요하신 경우 개발팀에 문의해 주세요.

---

## 🌟 프로젝트 현황

| 항목 | 상태 |
|------|------|
| **버전** | 1.3.1 |
| **마지막 업데이트** | 2025-11-17 |
| **유지보수** | 활발히 진행 중 |
| **문서화** | 완료 |
| **테스트 커버리지** | 진행 중 |

## 🔄 변경 이력

### v1.3.1 (2025-11-17)
- 🏷️ **모집공고-해시태그 시스템 구현**
  - recruitment_hashtags 중간 테이블 생성 (M:N 관계)
  - Hashtag 모델 스키마 PostgreSQL 호환성 작업
  - POST /api/recruitments 해시태그 생성 지원
    - # 기호 자동 제거 및 유효성 검사
    - 중복 필터링, 빈 값 제거, 최대 5개 제한
    - findOrCreate로 기존 태그 재사용
  - GET /api/recruitments/:id 응답에 Hashtags 배열 추가
  - 해시태그 필드: hashtag_id (UUID), name (문자열)
- 🔄 **Programmatic Migration 시스템**
  - Render Free Tier 대응 (Shell 없이 자동 마이그레이션)
  - SequelizeMeta 테이블로 마이그레이션 이력 추적
  - Production 환경 서버 시작 시 자동 실행
  - 마이그레이션 실패 시에도 서버 시작 보장
- 🔧 **데이터베이스 스키마 일치화**
  - Hashtag 모델: id → hashtag_id, content → name
  - 실제 PostgreSQL 스키마와 Sequelize 모델 동기화
  - 외래 키 제약조건 올바른 컬럼 참조 (hashtags.hashtag_id)

### v1.3.0 (2025-11-16)
- 📝 **지원서 제출 API 포트폴리오 연결 기능**
  - ApplicationPortfolio 모델 추가 (M:N 관계)
  - introduction 필드 추가 (필수, 1-500자)
  - 포트폴리오 프로젝트 선택 및 소유권 검증
  - 본인 모집글 지원 방지, 마감 여부 검증
- 🖼️ **모집공고 이미지 업로드** (Supabase Storage)
  - photo_url 필드 추가
  - 이미지 업로드 API (`/api/upload/recruitment-image`)
  - 파일 검증 (jpeg/png/webp, 최대 5MB)
  - UUID 기반 파일명 생성
  - RLS 정책 적용
- 🔐 **지원서 제출 보안 강화**
  - 트랜잭션 처리로 데이터 일관성 보장
  - 포트폴리오 소유권 검증 (ProjectMembers 확인)
  - 9가지 에러 코드 체계 구현
    - INVALID_INPUT, SELF_APPLICATION, RECRUITMENT_CLOSED
    - INVALID_PORTFOLIO, UNAUTHORIZED, RECRUITMENT_NOT_FOUND
    - ALREADY_APPLIED
- 📊 **지원자 목록 조회 개선**
  - 포트폴리오 프로젝트 정보 포함 (제목, 설명)
  - User 프로필 정보 포함

### v1.2.0 (2025-11-09)
- 🎯 대시보드 요약 API 구현 (`/api/dashboard/summary`)
  - 프로젝트 통계, 지원서 추적, 평가 대기 프로젝트, 최근 활동 타임라인
- 👤 현재 사용자 정보 API 추가 (`/api/auth/me`)
  - 로그인 응답에 user 객체 포함으로 프론트엔드 통합 간소화
- 📊 내 프로젝트 조회 API 개선 (`/api/projects/mine`)
  - evaluation_status 필드 지원 (COMPLETED, PENDING, NOT_REQUIRED)
  - 팀원 평가 상태 자동 계산 및 필터링 지원
- 🔔 Notifications 테이블 추가
  - 알림 시스템 기반 구축 (읽음/안읽음 상태 관리)
- 🗄️ PostgreSQL Raw SQL 전환
  - Sequelize ORM 대소문자 이슈 해결 (ProjectMembers → project_members)
  - 프로덕션 안정성 및 성능 향상
- ⚡ Recruitments 스키마 개선
  - user_id 컬럼 추가로 모집공고 작성자 추적 기능 강화
- 🔐 JWT 호환성 레이어 구현
  - Edge Function JWT (sub 필드) + Render JWT (userId 필드) 동시 지원
  - 마이그레이션 기간 중 원활한 전환 지원

### v1.1.0 (2025-11-07)
- ✅ SendGrid 도메인 인증 완료 (teamitaka.com)
- 🚀 Render 프로덕션 배포 완료
- ⚡ Nodemailer SMTP 폴백 제거 (성능 개선: 120초 → 2초)
- 🗄️ Supabase Shared Pooler 적용 (IPv4 호환성)
- 🔧 이메일 발송 시스템 최적화 (SendGrid Web API 전용)
- 🛠️ GitHub Actions 워크플로우 정리
- 📝 프론트엔드 통합 문서 작성

### v1.0.0 (2025-11-01)
- ✨ 초기 릴리즈
- 🔐 이메일 인증 시스템 구현
- 🔑 JWT 기반 인증 구현
- 📊 프로젝트 관리 CRUD
- 💬 댓글 시스템 구현
- 🔍 검색 기능 구현
- 🚀 Supabase 배포 지원

---

**개발**: TeamItaka Development Team
**문의**: GitHub Issues를 통해 연락 주세요
