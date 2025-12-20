# 🚀 TeamItaka Backend

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

팀 프로젝트 모집 및 협업을 위한 종합 RESTful API 서비스

> [English](README.en.md) | **한국어**

## 📋 목차

- [프로젝트 현황 요약](#-프로젝트-현황-요약)
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
- [개발 현황](#-개발-현황-development-status)
- [기여하기](#-기여하기)

## 📊 프로젝트 현황 요약

> 마지막 분석: 2025-12-20 | **전체 완료율: 94%**

| 항목 | 현황 | 상세 |
|------|:----:|------|
| **API 엔드포인트** | 76개 | 94% 구현 완료 |
| **컨트롤러** | 22개 | 전체 구현 |
| **서비스** | 19개 | 전체 구현 |
| **DB 모델** | 32개 | 스펙 26개 중 19개 + 추가 13개 |
| **마이그레이션** | 13개 | 최신 업데이트 완료 |
| **미들웨어** | 8개 | 인증, 검증, 업로드 등 |

### 핵심 기능 구현 현황

| 기능 | 상태 | 비고 |
|------|:----:|------|
| 인증 (이메일/구글/휴대폰) | ✅ | JWT, Firebase, OAuth |
| 프로젝트 CRUD + 킥오프 | ✅ | 모집→프로젝트 전환 |
| 모집공고 시스템 | ✅ | 해시태그, 이미지 업로드 |
| 지원/수락/거절 플로우 | ✅ | 포트폴리오 연결 |
| 팀원 평가 시스템 | ✅ | 5개 평가 항목 |
| 투표/일정 관리 | ⚠️ | 라우트 등록 필요 |
| 알림 시스템 | ❌ | 미구현 |

## ✨ 주요 기능

### 🔐 사용자 인증 및 권한 관리
- 6자리 인증 코드를 통한 이메일 인증 (SendGrid Web API)
- 도메인 인증 완료 (teamitaka.com)
- JWT 기반 인증 시스템
- 구글 OAuth 소셜 로그인
- **Firebase 전화번호 인증 (Phone Authentication)**
  - Firebase Admin SDK 통합
  - SMS 기반 전화번호 인증
  - 자동 사용자 생성 및 JWT 토큰 발급
  - 전화번호 인증 상태 추적
- bcrypt 기반 안전한 비밀번호 암호화
- Rate Limiting 적용 (중복 요청 방지)

### 📊 프로젝트 관리
- 프로젝트 생성, 조회, 수정, 삭제 (CRUD)
- 내 프로젝트 조회 (평가 상태 추적)
- 팀원 모집 시스템 (이미지 업로드 지원)
- **프로젝트 킥오프 (모집글 → 프로젝트 전환)**
  - 승인된 지원자 중 팀원 선택
  - 프로젝트 제목, 다짐(resolution), 기간 설정
  - Recruitment에서 project_type 자동 복사
- **키워드(해시태그) 기반 모집글 태깅 및 검색**
  - 모집글당 최대 5개 키워드 지원
  - # 기호 자동 제거 및 중복 제거
  - 키워드별 모집글 필터링
  - 전체 모집글 목록에서 키워드 표시
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
- **Firebase**: firebase-admin (전화번호 인증)
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
│   ├── config/          # 설정 파일 (4개: database, env, ...)
│   ├── controllers/     # 라우트 컨트롤러 (22개)
│   ├── middlewares/     # Express 미들웨어 (8개: 인증, 검증, 업로드)
│   ├── models/          # Sequelize 모델 (32개)
│   ├── routes/          # API 라우트 (18개)
│   ├── services/        # 비즈니스 로직 레이어 (19개)
│   ├── utils/           # 유틸리티 함수 (7개)
│   ├── validations/     # 요청 유효성 검증 스키마
│   ├── templates/       # 이메일 템플릿
│   ├── migrations/      # DB 마이그레이션 (13개)
│   └── app.js           # Express 앱 설정
├── tests/               # 테스트 파일
├── scripts/             # 유틸리티 스크립트
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
POST   /api/auth/phone/verify          # Firebase 전화번호 인증
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
GET    /api/projects/mine              # 내 프로젝트 조회
GET    /api/projects/:id               # 프로젝트 상세 조회
POST   /api/projects                   # 새 프로젝트 생성
POST   /api/projects/from-recruitment/:id  # 모집글에서 프로젝트 킥오프
PUT    /api/projects/:id               # 프로젝트 수정
DELETE /api/projects/:id               # 프로젝트 삭제
```

**`/api/projects/mine` 쿼리 파라미터:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `status` | string | `ongoing`/`active` → 진행 중, `completed` → 완료 |
| `evaluation_status` | string | `PENDING`, `COMPLETED`, `NOT_REQUIRED` |
| `limit` | number | 조회 개수 제한 |
| `offset` | number | 페이지네이션 오프셋 |

#### 📢 모집공고 (Recruitments)
```
GET    /api/recruitments               # 전체 모집공고 목록 (지원자 수, 키워드 포함)
GET    /api/recruitments/mine          # 내 모집공고 조회 (키워드 포함)
GET    /api/recruitments/:id           # 모집공고 상세 조회 (작성자 ID, 지원자 수, 키워드 포함)
POST   /api/recruitments               # 모집공고 작성 (키워드 배열 지원)
PUT    /api/recruitments/:id           # 모집공고 수정 (키워드 업데이트 지원)
DELETE /api/recruitments/:id           # 모집공고 삭제
```

**응답 형식 예시** (Hashtags 필드):
```json
{
  "recruitment_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "프론트엔드 개발자 모집",
  "status": "OPEN",
  "applicationCount": 5,
  "Hashtags": [
    { "name": "React" },
    { "name": "TypeScript" },
    { "name": "Next.js" }
  ]
}
```

> ⚠️ **주의**: `Hashtags` 필드는 대문자 H로 시작합니다 (Sequelize 자동 생성). 키워드가 없는 모집글은 `null` 또는 `[]`을 반환할 수 있습니다.

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
POST   /api/upload/profile-image       # 프로필 이미지 업로드 (JWT 필수)
```

#### 💬 댓글 (Comments)
```
GET    /api/comments/:projectId        # 프로젝트 댓글 조회
POST   /api/comments                   # 댓글 작성
PUT    /api/comments/:id               # 댓글 수정
DELETE /api/comments/:id               # 댓글 삭제
```

#### 👤 프로필 (Profile)
```
GET    /api/profile/me                 # 내 프로필 조회
PUT    /api/profile                    # 프로필 수정
GET    /api/profile/detail             # 프로필 상세 조회
GET    /api/profile/verification       # 인증 상태 조회
```

#### ⭐ 평가 (Reviews)
```
POST   /api/reviews                        # 팀원 평가 생성
GET    /api/reviews/user/:user_id          # 사용자가 받은 평가 조회
GET    /api/reviews/project/:project_id    # 프로젝트 평가 목록
GET    /api/reviews/project/:project_id/summary  # 프로젝트 평가 요약
DELETE /api/reviews/:review_id             # 평가 삭제
```

#### 📌 스크랩 (Scraps)
```
GET    /api/scraps/recruitments            # 스크랩한 모집공고 목록
PUT    /api/scraps/recruitment/:id/scrap   # 스크랩 토글 (추가/제거)
```

#### 📅 일정 (Schedule) ⚠️ *라우트 등록 필요*
```
POST   /api/schedule/create            # 일정 생성
GET    /api/schedule/project/:project_id # 프로젝트별 일정 조회
PUT    /api/schedule/:schedule_id      # 일정 수정
DELETE /api/schedule/:schedule_id      # 일정 삭제
```

#### 🗳️ 투표 (Vote) ⚠️ *라우트 등록 필요*
```
POST   /api/vote/create                # 투표 생성
GET    /api/vote/project/:project_id   # 프로젝트별 투표 조회
GET    /api/vote/:voteId               # 투표 상세 조회
POST   /api/vote/:voteId/submit        # 투표 제출
```

> ⚠️ **참고**: Schedule, Vote API는 컨트롤러/서비스가 구현되어 있으나 `app.js`에 라우트 등록이 필요합니다.

#### 📝 프로젝트 게시판 (Project Posts)
```
POST   /api/:project_id/posts          # 게시물 생성
GET    /api/:project_id/posts          # 게시물 목록 조회
GET    /api/posts/:post_id             # 게시물 상세 조회
```

#### 💾 임시저장 (Drafts)
```
POST   /api/recruitment/draft          # 모집공고 임시저장
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

### 데이터베이스 모델 (32개)

> 스펙 26개 테이블 중 19개 구현 + 추가 13개 모델

#### 핵심 모델

| 모델 | 설명 | 스펙 매핑 |
|------|------|----------|
| **User** | 사용자 계정 및 프로필 | users |
| **Project** | 프로젝트 정보 | projects |
| **ProjectMembers** | 프로젝트 팀 멤버 | project_members |
| **Recruitment** | 모집 공고 (이미지, 해시태그 지원) | recruitment_posts |
| **Application** | 지원서 (자기소개 + 포트폴리오) | applications |
| **ApplicationPortfolio** | 지원서-포트폴리오 연결 (M:N) | application_projects |

#### 부가 기능 모델

| 모델 | 설명 | 스펙 매핑 |
|------|------|----------|
| **Hashtag** | 해시태그 관리 | recruitment_hashtags |
| **Comment** | 프로젝트 댓글 | - (추가) |
| **Review** | 팀원 평가 시스템 | peer_evaluations |
| **Notification** | 사용자 알림 | notifications |
| **Scrap** | 북마크 | bookmarks |
| **Todo** | 할 일 관리 | todos |

#### 투표 시스템 모델

| 모델 | 설명 | 스펙 매핑 |
|------|------|----------|
| **Vote** | 투표 생성 | votes |
| **VoteOption** | 투표 선택지 | vote_options |
| **VoteResponse** | 투표 응답 | vote_responses |

#### 일정 및 타임라인 모델

| 모델 | 설명 | 스펙 매핑 |
|------|------|----------|
| **Schedule** | 일정 관리 | calendar_events |
| **Timeline** | 타임라인 이벤트 | - (추가) |
| **ProjectPost** | 프로젝트 피드 | project_feeds |

#### 사용자 관련 모델

| 모델 | 설명 | 스펙 매핑 |
|------|------|----------|
| **University** | 대학 정보 | universities |
| **College** | 단과대 정보 | - (추가) |
| **Department** | 학과 정보 | - (추가) |
| **EmailVerification** | 이메일 인증 | verification_codes |
| **VerifiedEmail** | 인증 완료 이메일 | - (추가) |
| **Search** | 검색 기록 | search_history |

#### 팀플 유형 및 피드백 모델

| 모델 | 설명 | 스펙 매핑 |
|------|------|----------|
| **TeamiType** | 팀플 캐릭터 유형 | - (추가) |
| **UserTeamiType** | 사용자-캐릭터 매핑 | - (추가) |
| **UserFeedback** | 사용자 피드백 | - (추가) |
| **FeedbackItem** | 피드백 항목 | - (추가) |
| **Keyword** | 키워드 관리 | - (추가) |

#### 시스템 모델

| 모델 | 설명 | 스펙 매핑 |
|------|------|----------|
| **Admin** | 관리자 계정 | - (추가) |
| **RecruitmentView** | 조회수 추적 | - (추가) |

#### ❌ 미구현 테이블 (7개)

| 스펙 테이블 | 용도 | 우선순위 |
|-------------|------|----------|
| user_stats | 사용자 통계 집계 | 중 |
| user_settings | 사용자 설정 | 중 |
| popular_keywords | 인기 검색어 | 하 |
| project_invitations | QR 초대 | 중 |
| draft_recruitment_posts | 모집글 임시저장 | 하 |
| meeting_notes | 회의록 | 중 |
| team_chat_messages | 팀 채팅 | 하 |

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
- `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` (전화번호 인증)
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

# Firebase Phone Authentication
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_API_KEY=your_web_api_key                    # Firebase Console → 프로젝트 설정 → 웹 API 키

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
- **[API 변경사항 - 키워드 기능](docs/api_changes_hashtags.md)** - 모집글 키워드 API 통합 가이드
- [데이터베이스 스키마](docs/DATABASE_SCHEMA.md)
- [배포 가이드](docs/deployment/DEPLOYMENT_GUIDE.md)
- [로컬 개발 환경 설정](docs/deployment/LOCAL_DEV_SETUP_GUIDE.md)
- [이메일 인증 구현](docs/EmailVerification/IMPLEMENTATION_GUIDE.md)
- [구글 OAuth 구현](docs/GoogleSocialLogin/IMPLEMENTATION_GUIDE.md)
- [SendGrid 도메인 인증 가이드](https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication)

### 🛠️ 유틸리티 스크립트

`scripts/` 디렉토리의 유틸리티 스크립트:

- [verify_hashtags.sql](scripts/verify_hashtags.sql) - 키워드 데이터 정합성 검증 SQL

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
| **버전** | 1.5.4 |
| **마지막 업데이트** | 2025-12-20 |
| **유지보수** | 활발히 진행 중 |
| **문서화** | 완료 |
| **테스트 커버리지** | 진행 중 |
| **Swagger 문서** | [API Docs](https://teamitakabackend.onrender.com/api-docs) |

## 📊 개발 현황 (Development Status)

> 마지막 분석: 2025-12-20 | 전체 완료율: **94%**

### 🎯 전체 개발 진행률

| 구분 | 완료 | 진행중 | 미구현 | 완료율 |
|------|:----:|:------:|:------:|:------:|
| API 엔드포인트 | 76개 | 2개 | 4개 | 94% |
| 라우트 파일 | 18개 | 2개 | 0개 | 90% |
| 컨트롤러 | 22개 | 0개 | 0개 | 100% |
| 서비스 | 19개 | 0개 | 0개 | 100% |
| 모델 | 32개 | 0개 | 0개 | 100% |

### 🔧 기능별 구현 현황

| 기능 | 상태 | 엔드포인트 | 비고 |
|------|:----:|:----------:|------|
| 🔐 인증 (Auth) | ✅ 완료 | 8개 | JWT, OAuth, Firebase Phone |
| 📧 이메일/SMS 인증 | ✅ 완료 | 4개 | SendGrid, Rate Limiting |
| 📢 모집공고 | ✅ 완료 | 8개 | CRUD, 스크랩, 해시태그, 조회수 |
| 📝 지원 관리 | ✅ 완료 | 4개 | 지원, 승인/거절, 포트폴리오 |
| 📊 프로젝트 | ✅ 완료 | 10개 | CRUD, 킥오프, 팀원 관리 |
| ✅ 할 일 (Todo) | ✅ 완료 | 4개 | 프로젝트별 할 일 관리 |
| 📅 타임라인 | ✅ 완료 | 4개 | 프로젝트 타임라인 |
| 👥 팀원 관리 | ✅ 완료 | 2개 | 역할 조회/수정 |
| ⭐ 평가 (Review) | ✅ 완료 | 6개 | 팀원 상호평가 (5개 항목) |
| 👤 프로필 | ✅ 완료 | 7개 | 조회, 수정, 인증 상태, 평점 |
| 💬 댓글 | ✅ 완료 | 2개 | 모집공고 댓글 |
| 🖼️ 업로드 | ✅ 완료 | 2개 | Supabase Storage |
| 📌 스크랩 | ✅ 완료 | 2개 | 모집공고 스크랩 |
| 🛡️ 관리자 | ✅ 완료 | 3개 | 인증 사용자 관리 |
| 📈 대시보드 | ✅ 완료 | 1개 | 통계, 알림, 타임라인 |
| 💾 임시저장 | 🟡 부분 | 1개 | 생성만 구현 |
| 📋 프로젝트 게시물 | ✅ 완료 | 3개 | 프로젝트 피드 |
| 🔍 검색 | ✅ 완료 | 1개 | 통합 검색 |
| 🗳️ 투표 (Vote) | ⚠️ 미등록 | 4개 | 코드 완성, app.js 등록 필요 |
| 📆 일정 (Schedule) | ⚠️ 미등록 | 4개 | 코드 완성, app.js 등록 필요 |

### ⚠️ 해결 필요 사항

| 우선순위 | 이슈 | 영향 범위 | 예상 시간 |
|:--------:|------|----------|:--------:|
| 🔴 긴급 | Vote 라우트 app.js 미등록 | 투표 기능 전체 | 5분 |
| 🔴 긴급 | Schedule 라우트 app.js 미등록 | 일정 관리 전체 | 5분 |
| 🟡 보통 | /api/auth/logout 미구현 | 로그아웃 | 1시간 |
| 🟡 보통 | /api/auth/refresh 미구현 | 토큰 갱신 | 2시간 |
| 🟡 보통 | /api/auth/password/reset 미구현 | 비밀번호 재설정 | 4시간 |
| 🟡 보통 | /api/applications/:id/cancel 미구현 | 지원 취소 | 1시간 |
| 🟢 낮음 | 알림 시스템 API 미구현 | 알림 기능 | 1일 |
| 🟢 낮음 | 회의록 API 미구현 | 회의 관리 | 1일 |
| 🟢 낮음 | QR 초대 API 미구현 | 프로젝트 초대 | 4시간 |

### 🗂️ 레이어별 현황

| 레이어 | 파일 수 | 구현 현황 |
|--------|:-------:|----------|
| Routes | 18개 | 16개 등록, 2개 미등록 (vote, schedule) |
| Controllers | 22개 | 전체 구현 완료 |
| Services | 19개 | 전체 구현 완료 |
| Models | 32개 | 전체 구현 완료 |
| Middlewares | 8개 | auth, admin, optional, error, validation, upload, rateLimit 등 |

### 📋 상태 범례

| 상태 | 설명 |
|:----:|------|
| ✅ 완료 | 기능 완전 구현 및 동작 확인 |
| 🟡 부분 | 기본 기능 구현, 일부 기능 미완성 |
| ⚠️ 미등록 | 코드 완성되었으나 라우트 미등록 |
| ❌ 미구현 | 구현 필요 |
| 🔴 긴급 | 즉시 해결 필요 (5분 이내) |
| 🟡 보통 | 단기 해결 (1-2일) |
| 🟢 낮음 | 중기 해결 (1주) |

## 🔄 변경 이력

### v1.5.4 (2025-12-20)
- ✨ **내 프로젝트 API 최신 피드 시간 추가** (`GET /api/projects/mine`)
  - 응답에 `last_feed_at` 필드 추가 (ISO 8601 timestamp 또는 null)
  - 프로젝트 카드에 '2시간 전' 형태의 상대 시간 표시 지원
  - `project_posts` 테이블의 최신 게시물 시간 기준
- 🐛 **내 모집공고 목록 CLOSED 상태 필터링 버그 수정**
  - 프로젝트 킥오프 후 '모집중' 탭에서 사라지도록 수정
  - ACTIVE 상태의 모집공고만 조회되도록 쿼리 수정

### v1.5.3 (2025-12-20)
- ✨ **프로젝트 킥오프 API 개선** (`POST /api/projects/from-recruitment/:id`)
  - 프론트엔드에서 직접 프로젝트 제목 입력
  - 다짐(resolution) 필드 추가
  - 승인된 지원자 중 팀원 선택 기능 (`memberUserIds` 배열)
  - Recruitment에서 `project_type` 자동 복사 (course/side)
- 🗄️ **Project 모델 스키마 확장**
  - `resolution`: 프로젝트 다짐 (TEXT)
  - `project_type`: 프로젝트 유형 (ENUM: 'course', 'side')
- 🐛 **버그 수정**
  - Application status 검색 버그 수정 (ACCEPTED → memberUserIds 직접 전달)

### v1.5.2 (2025-12-18)
- 🐛 **Application API Sequelize alias 버그 수정**
  - `as: "ProjectMembers"` 누락으로 인한 500 에러 해결
  - 포트폴리오 프로젝트 검증 로직 정상화
- 📝 **Swagger API 문서 대규모 업데이트**
  - Profile API 4개 엔드포인트 추가 (`/me`, `/detail`, `/verification`, `PUT /`)
  - Vote API 4개 엔드포인트 문서화
  - Schedule API 4개 엔드포인트 문서화
  - Upload API `/profile-image` 엔드포인트 추가
  - `/projects/mine` 쿼리 파라미터 상세 문서화 (status, evaluation_status, limit, offset)
  - `/applications/{recruitment_id}` portfolio_project_ids 파라미터 문서화
- 🔧 **API 문서 품질 개선**
  - 응답 스키마 상세화
  - 에러 코드 및 메시지 문서화

### v1.5.1 (2025-12-02)
- 🔧 **Sequelize 모델 PostgreSQL 호환성 개선**
  - 12개 모델에 `tableName` 속성 추가 (PostgreSQL snake_case 테이블명 매핑)
  - 영향받는 모델: User, Project, ProjectMembers, Recruitment, Application, Review, Comment, Todo, Timeline, Vote, Schedule, Notification 등
- 🐛 **모델 스키마 버그 수정**
  - ProjectMembers 모델: 데이터베이스 스키마와 일치하도록 수정
  - Todo 모델: 컬럼 정의를 데이터베이스 스키마에 맞게 수정
  - Project 모델: 존재하지 않는 `role` 컬럼 제거
- ⚡ **쿼리 최적화**
  - ProjectMembers include에서 불필요한 attributes 제약 제거

### v1.5.0 (2025-11-24)
- 📱 **Firebase 전화번호 인증 구현**
  - Firebase Admin SDK 통합 (firebase-admin@^12.0.0)
  - 전화번호 기반 사용자 인증 API 추가 (`POST /api/auth/phone/verify`)
  - Users 테이블 스키마 확장:
    - `firebase_phone_uid`: Firebase Phone Auth UID
    - `phone_number`: E.164 형식 전화번호 저장
    - `phone_verified`: 전화번호 인증 완료 여부
    - `phone_verified_at`: 인증 완료 시각
  - 신규 사용자 자동 생성 및 JWT 토큰 발급
  - 기존 사용자 전화번호 업데이트 지원
  - `requirePhoneVerified` 미들웨어 추가 (전화번호 인증 필수 라우트용)
  - 로컬(MySQL) 및 프로덕션(Supabase PostgreSQL) 마이그레이션 완료
  - 전화번호 인증 테스트 스크립트 포함 ([test-phone-auth.js](test-phone-auth.js))
- 🐛 **User 모델 버그 수정 및 환경별 호환성 개선**
  - 중복된 `user_type` 필드 제거 (role 필드와 중복, 데이터베이스 컬럼 오류 해결)
  - 환경별 타임스탬프 컬럼명 설정 추가:
    - Local (MySQL): camelCase (`createdAt`, `updatedAt`)
    - Production (PostgreSQL): snake_case (`created_at`, `updated_at`)
    - `NODE_ENV`에 따른 자동 전환으로 데이터베이스 호환성 보장
  - 존재하지 않는 `experience_years` 필드 제거
- 🔧 **Recruitment Status 통일 (Database 호환성 해결)**
  - Local과 Production DB 간 status 값 불일치 해결:
    - Local (MySQL): ENUM('OPEN', 'CLOSED') → ENUM('ACTIVE', 'CLOSED', 'FILLED')
    - Production (PostgreSQL): CHECK('ACTIVE', 'CLOSED', 'FILLED') - 기존 유지
  - 코드 전체 통일: 'OPEN' → 'ACTIVE' 변경
    - Recruitment 모델 ENUM 정의 수정
    - recruitmentService, applicationService, loadMockupData 업데이트
  - Local MySQL 마이그레이션 생성 및 실행 완료
    - 기존 22개 레코드 자동 마이그레이션 (OPEN → ACTIVE)
  - Status 값 정의:
    - ACTIVE: 모집중 (기존 OPEN)
    - CLOSED: 모집마감
    - FILLED: 모집완료 (Production 기존 데이터)
- 📝 **문서화**
  - Firebase 전화번호 인증 가이드 추가
  - 환경 변수 설정 가이드 업데이트
  - API 엔드포인트 문서 업데이트

### v1.4.1 (2025-11-24)
- 🏷️ **모집글 키워드 기능 개선**
  - `GET /api/recruitments` 응답에 Hashtags 필드 추가
  - 모집글 목록 조회 시 키워드 정보 포함
  - 키워드가 없는 모집글 처리 개선 (null 또는 빈 배열)
  - 프론트엔드 통합 가이드 작성 ([docs/api_changes_hashtags.md](docs/api_changes_hashtags.md))
- 🐛 **버그 수정**
  - 모집글 생성 시 status 값 통일 (ACTIVE → OPEN)
  - Sequelize 모델 ENUM과 일치하도록 수정
- 📝 **문서화**
  - SQL 검증 스크립트 추가 ([scripts/verify_hashtags.sql](scripts/verify_hashtags.sql))
  - 프론트엔드 API 변경사항 문서 작성
  - React/Vue 컴포넌트 예시 코드 제공
  - TypeScript 타입 정의 가이드 포함

### v1.4.0 (2025-11-22)
- 📅 **일정 관리 기능 추가**
  - 프로젝트별 일정 생성, 조회, 수정, 삭제 API 구현
- 📝 **프로젝트 게시판 기능 추가**
  - 프로젝트 내 게시물 작성 및 조회 기능 구현
- 💾 **모집공고 임시저장 기능**
  - 작성 중인 모집공고 임시저장 API 추가

### v1.3.1 (2025-11-20)
- 🎯 **모집공고 상세 조회 API 개선** (`GET /api/recruitments/:id`)
  - `user_id` 필드 추가: 모집글 작성자 ID 반환 (프론트엔드 소유자 확인용)
  - `applicant_count` 필드 추가: 실시간 지원자 수 계산 (서브쿼리)
  - `created_at` 필드 포함: 모집글 생성 시간
  - 프론트엔드 조건부 렌더링 지원 (작성자: "지원자 보기", 일반 사용자: "지원하기")
- 🐛 **Hashtag 모델 버그 수정**
  - 해시태그 attributes 수정: `content` → `name`
  - 모집공고 상세 조회 시 해시태그 정상 반환

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
