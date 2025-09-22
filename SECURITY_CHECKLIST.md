# 보안 체크리스트 🔐

## 🚨 긴급 보안 사항

### ✅ 완료된 보안 조치
- [x] `.env` 파일을 `.gitignore`에 추가
- [x] `vercel.json`에서 민감한 정보 제거
- [x] 환경 변수 템플릿 파일 생성 (`env.example`)
- [x] 환경별 설정 파일 분리
- [x] 환경 변수 로더 구현

### ⚠️ 즉시 수정 필요한 사항
- [ ] **`env.supabase` 파일 삭제 또는 이동** (민감한 정보 포함)
- [ ] **`vercel.json`에서 하드코딩된 정보 제거** (완료됨)
- [ ] **Git 히스토리에서 민감한 정보 제거**

## 🔍 민감한 정보 검사

### 현재 코드베이스에서 발견된 민감한 정보

#### 1. `env.supabase` 파일
```bash
# 이 파일에는 다음 민감한 정보가 포함되어 있습니다:
- DB_PASSWORD=marvelkoala1229!
- SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- SENDGRID_API_KEY=SG.your-sendgrid-api-key
```

**조치 방법:**
```bash
# 1. 파일을 안전한 위치로 이동
mv env.supabase .env.local

# 2. .gitignore에 추가 (이미 완료됨)
echo "env.supabase" >> .gitignore

# 3. Git에서 파일 제거
git rm --cached env.supabase
git commit -m "Remove sensitive env.supabase file"
```

#### 2. Git 히스토리 정리
```bash
# Git 히스토리에서 민감한 파일 제거
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch env.supabase' \
  --prune-empty --tag-name-filter cat -- --all

# 강제 푸시 (주의: 팀원들과 협의 필요)
git push origin --force --all
```

## 🛡️ 환경별 보안 설정

### 로컬 개발 환경
- [x] `.env` 파일 사용
- [x] `env.example` 템플릿 제공
- [x] 환경 변수 검증 로직

### Vercel 배포 환경
- [x] Vercel Environment Variables 사용
- [x] `vercel.json`에서 민감한 정보 제거
- [ ] Vercel 대시보드에서 환경 변수 설정 확인

### GitHub Actions
- [x] GitHub Secrets 사용
- [x] 워크플로우 파일 생성
- [ ] GitHub Secrets 설정 확인

## 🔐 API 키 및 비밀번호 관리

### 현재 사용 중인 민감한 정보
1. **데이터베이스 비밀번호**: `marvelkoala1229!`
2. **Supabase Service Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. **SendGrid API Key**: `SG.your-sendgrid-api-key`
4. **JWT Secret**: `DFF8C22C-CE73-4F90-A7F1-F48941D5AAF3`

### 권장 조치
1. **즉시 비밀번호 변경**
2. **API 키 재생성**
3. **강력한 JWT Secret 생성**

## 📋 배포 환경별 설정 가이드

### Vercel 환경 변수 설정
```bash
# Vercel CLI 사용
vercel env add DB_PASSWORD
vercel env add SUPABASE_SERVICE_KEY
vercel env add SENDGRID_API_KEY
vercel env add JWT_SECRET
```

### GitHub Secrets 설정
Repository → Settings → Secrets and variables → Actions에서 다음 추가:
- `DB_PASSWORD`
- `SUPABASE_SERVICE_KEY`
- `SENDGRID_API_KEY`
- `JWT_SECRET`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## 🚨 보안 사고 대응

### 1. 민감한 정보 노출 시
```bash
# 1. 즉시 API 키 무효화
# 2. 비밀번호 변경
# 3. Git 히스리 정리
# 4. 새로운 키로 재배포
```

### 2. 의심스러운 활동 감지 시
```bash
# 1. 모든 API 키 재생성
# 2. 데이터베이스 비밀번호 변경
# 3. 접근 로그 확인
# 4. 보안 감사 수행
```

## 🔄 정기 보안 점검

### 월간 점검 사항
- [ ] API 키 갱신
- [ ] 비밀번호 강도 확인
- [ ] 접근 로그 검토
- [ ] 의존성 보안 업데이트

### 분기별 점검 사항
- [ ] 전체 보안 감사
- [ ] 권한 재검토
- [ ] 백업 복구 테스트
- [ ] 보안 정책 업데이트

## 📞 보안 문의

보안 관련 문제나 문의사항이 있으시면:
1. 이슈 생성 시 `security` 라벨 추가
2. 민감한 정보는 공개 채널에 노출 금지
3. 보안 담당자에게 직접 연락

---

**⚠️ 중요**: 이 체크리스트의 모든 항목을 완료한 후에 프로덕션 배포를 진행하세요!
