# 환경 변수 설정 가이드 🔐

## 📋 개요
이 가이드는 민감한 정보를 안전하게 관리하고 다양한 배포 환경에서 환경 변수를 올바르게 설정하는 방법을 설명합니다.

## 🚨 보안 원칙
- **절대 금지**: 민감한 정보를 코드에 하드코딩하지 마세요
- **환경 분리**: 개발/스테이징/프로덕션 환경별로 다른 설정 사용
- **최소 권한**: 각 환경에 필요한 최소한의 권한만 부여
- **정기 갱신**: API 키와 비밀번호를 정기적으로 갱신

## 📁 파일 구조

```
project/
├── .env                    # 로컬 개발용 (Git에 커밋 안됨)
├── .env.example           # 환경 변수 템플릿 (Git에 커밋됨)
├── env.example            # 환경 변수 템플릿 (Git에 커밋됨)
├── env.supabase           # Supabase 전용 설정 (Git에 커밋 안됨)
├── .gitignore             # Git 무시 파일 설정
└── vercel.json            # Vercel 배포 설정
```

## 🔧 로컬 개발 환경 설정

### 1. 환경 변수 파일 생성
```bash
# 1. env.example을 복사하여 .env 생성
cp env.example .env

# 2. .env 파일을 편집하여 실제 값 입력
nano .env
```

### 2. .env 파일 내용
```bash
# 기본 설정
NODE_ENV=development
PORT=8080

# Supabase 데이터베이스 설정
DB_HOST=your-supabase-db-host
DB_NAME=postgres
DB_USER=postgres.your-project-ref
DB_PASSWORD=your-database-password
DB_PORT=6543
DB_DIALECT=postgres

# Supabase API 설정
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 인증 설정
JWT_SECRET=your-super-secret-jwt-key-here

# 관리자 계정
ADMIN_EMAIL=admin@teamitaka.com
ADMIN_PASSWORD=your-secure-admin-password

# 이메일 서비스 설정
EMAIL_SERVICE=sendgrid
EMAIL_FROM=noreply@teamitaka.com
SENDGRID_API_KEY=SG.your-sendgrid-api-key

# CORS 설정
CORS_ORIGIN=http://localhost:3000

# UnivCert API
UNIVCERT_API_KEY=your-univcert-api-key

# Google OAuth 설정
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🚀 Vercel 배포 환경 설정

### 1. Vercel 대시보드에서 설정
1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. Settings → Environment Variables 이동
4. 다음 변수들을 추가:

### 2. Vercel에 추가할 환경 변수

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `NODE_ENV` | `production` | 환경 설정 |
| `PORT` | `8080` | 포트 번호 |
| `DB_HOST` | `your-supabase-db-host` | 데이터베이스 호스트 |
| `DB_NAME` | `postgres` | 데이터베이스 이름 |
| `DB_USER` | `postgres.your-project-ref` | 데이터베이스 사용자 |
| `DB_PASSWORD` | `your-database-password` | 데이터베이스 비밀번호 |
| `DB_PORT` | `6543` | 데이터베이스 포트 |
| `DB_DIALECT` | `postgres` | 데이터베이스 타입 |
| `SUPABASE_URL` | `https://your-project-ref.supabase.co` | Supabase URL |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase Anon Key |
| `SUPABASE_SERVICE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase Service Key |
| `JWT_SECRET` | `your-super-secret-jwt-key-here` | JWT 비밀키 |
| `ADMIN_EMAIL` | `admin@teamitaka.com` | 관리자 이메일 |
| `ADMIN_PASSWORD` | `your-secure-admin-password` | 관리자 비밀번호 |
| `EMAIL_SERVICE` | `sendgrid` | 이메일 서비스 |
| `EMAIL_FROM` | `noreply@teamitaka.com` | 발신자 이메일 |
| `SENDGRID_API_KEY` | `SG.your-sendgrid-api-key` | SendGrid API 키 |
| `CORS_ORIGIN` | `https://www.teamitaka.com` | CORS 허용 도메인 |
| `UNIVCERT_API_KEY` | `your-univcert-api-key` | UnivCert API 키 |
| `GOOGLE_CLIENT_ID` | `your-google-client-id` | Google OAuth 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | `your-google-client-secret` | Google OAuth 클라이언트 시크릿 |

### 3. Vercel CLI로 설정 (선택사항)
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 환경 변수 설정
vercel env add NODE_ENV
vercel env add DB_HOST
vercel env add DB_PASSWORD
# ... 나머지 변수들도 동일하게 설정
```

## 🔐 GitHub Secrets 설정

### 1. GitHub Repository Secrets 설정
1. GitHub Repository → Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. 다음 시크릿들을 추가:

### 2. GitHub Actions에 추가할 Secrets

| Secret 이름 | 값 | 설명 |
|-------------|-----|------|
| `SUPABASE_URL` | `https://your-project-ref.supabase.co` | Supabase URL |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase Anon Key |
| `SUPABASE_SERVICE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase Service Key |
| `JWT_SECRET` | `your-super-secret-jwt-key-here` | JWT 비밀키 |
| `SENDGRID_API_KEY` | `SG.your-sendgrid-api-key` | SendGrid API 키 |
| `UNIVCERT_API_KEY` | `your-univcert-api-key` | UnivCert API 키 |
| `GOOGLE_CLIENT_SECRET` | `your-google-client-secret` | Google OAuth 클라이언트 시크릿 |
| `DB_PASSWORD` | `your-database-password` | 데이터베이스 비밀번호 |
| `ADMIN_PASSWORD` | `your-secure-admin-password` | 관리자 비밀번호 |

### 3. GitHub Actions 워크플로우에서 사용
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🛡️ 보안 체크리스트

### ✅ 필수 보안 사항
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] `env.example` 파일에 실제 값이 아닌 예시 값이 있는가?
- [ ] 프로덕션 환경에서 강력한 비밀번호를 사용하는가?
- [ ] API 키가 정기적으로 갱신되는가?
- [ ] 불필요한 권한이 부여되지 않았는가?

### 🔍 민감한 정보 확인
다음 정보들이 코드에 하드코딩되어 있지 않은지 확인하세요:
- [ ] 데이터베이스 비밀번호
- [ ] API 키 (SendGrid, Google OAuth 등)
- [ ] JWT 비밀키
- [ ] 관리자 계정 정보
- [ ] Supabase Service Key

## 🚨 주의사항

### ❌ 절대 하지 말아야 할 것들
1. **코드에 비밀번호 하드코딩**
2. **Git에 .env 파일 커밋**
3. **공개 저장소에 API 키 노출**
4. **개발용 비밀번호를 프로덕션에서 사용**

### ✅ 올바른 방법
1. **환경 변수 사용**
2. **.gitignore로 민감한 파일 제외**
3. **배포 환경별 다른 설정 사용**
4. **정기적인 보안 감사**

## 🔄 환경 변수 갱신 절차

### 1. API 키 갱신 시
```bash
# 1. 로컬 .env 파일 업데이트
nano .env

# 2. Vercel 환경 변수 업데이트
vercel env add SENDGRID_API_KEY

# 3. GitHub Secrets 업데이트
# GitHub Repository → Settings → Secrets에서 수동 업데이트

# 4. 애플리케이션 재배포
vercel --prod
```

### 2. 비밀번호 갱신 시
```bash
# 1. 새로운 비밀번호 생성
openssl rand -base64 32

# 2. 모든 환경에서 업데이트
# - 로컬 .env
# - Vercel Environment Variables
# - GitHub Secrets
# - Supabase Dashboard (필요시)
```

## 📞 문제 해결

### 환경 변수가 로드되지 않는 경우
```bash
# 1. .env 파일 존재 확인
ls -la .env

# 2. 파일 권한 확인
chmod 600 .env

# 3. 애플리케이션 재시작
npm restart
```

### Vercel에서 환경 변수 오류
```bash
# 1. Vercel CLI로 환경 변수 확인
vercel env ls

# 2. 특정 환경 변수 확인
vercel env pull .env.vercel
```

이 가이드를 따라 설정하면 민감한 정보를 안전하게 관리할 수 있습니다! 🔐
