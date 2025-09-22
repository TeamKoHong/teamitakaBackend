# 프론트엔드 인증 헤더 수정 가이드

## 문제 상황
프론트엔드에서 Supabase Edge Function을 호출할 때 401 Unauthorized 오류가 발생합니다.

```
POST https://huwajjafqbfrcxkdfker.supabase.co/functions/v1/teamitaka-api/api/auth/send-verification 401 (Unauthorized)
Backend error details: {code: 401, message: 'Missing authorization header'}
```

## 해결 방법

### 1. 프론트엔드 auth.js 파일 수정

현재 프론트엔드의 `auth.js` 파일에서 API 호출 부분을 다음과 같이 수정해야 합니다:

```javascript
// ❌ 현재 코드 (오류 발생)
const response = await fetch('https://huwajjafqbfrcxkdfker.supabase.co/functions/v1/teamitaka-api/api/auth/send-verification', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email })
});

// ✅ 수정된 코드 (인증 헤더 포함)
const response = await fetch('https://huwajjafqbfrcxkdfker.supabase.co/functions/v1/teamitaka-api/api/auth/send-verification', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1d2FqamFmcWJmcmN4a2Rma2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNTAwODQsImV4cCI6MjA3MzkyNjA4NH0.PHZV8n3P91Ssx3Jg2KR-BfQ-e8-rm3LAArJb_6NkxyA',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1d2FqamFmcWJmcmN4a2Rma2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNTAwODQsImV4cCI6MjA3MzkyNjA4NH0.PHZV8n3P91Ssx3Jg2KR-BfQ-e8-rm3LAArJb_6NkxyA'
  },
  body: JSON.stringify({ email })
});
```

### 2. 환경 변수 사용 (권장)

보안을 위해 하드코딩 대신 환경 변수를 사용하세요:

```javascript
// .env 파일에 추가
REACT_APP_SUPABASE_URL=https://huwajjafqbfrcxkdfker.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1d2FqamFmcWJmcmN4a2Rma2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNTAwODQsImV4cCI6MjA3MzkyNjA4NH0.PHZV8n3P91Ssx3Jg2KR-BfQ-e8-rm3LAArJb_6NkxyA

// auth.js에서 사용
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

const response = await fetch(`${SUPABASE_URL}/functions/v1/teamitaka-api/api/auth/send-verification`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'apikey': SUPABASE_ANON_KEY
  },
  body: JSON.stringify({ email })
});
```

### 3. Supabase 클라이언트 사용 (가장 권장)

Supabase JavaScript 클라이언트를 사용하면 자동으로 인증 헤더가 처리됩니다:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://huwajjafqbfrcxkdfker.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1d2FqamFmcWJmcmN4a2Rma2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNTAwODQsImV4cCI6MjA3MzkyNjA4NH0.PHZV8n3P91Ssx3Jg2KR-BfQ-e8-rm3LAArJb_6NkxyA'
)

// Edge Function 호출
const { data, error } = await supabase.functions.invoke('teamitaka-api', {
  body: { email }
})
```

## 테스트

수정 후 다음 명령어로 테스트할 수 있습니다:

```bash
curl -X POST 'https://huwajjafqbfrcxkdfker.supabase.co/functions/v1/teamitaka-api/api/auth/send-verification' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1d2FqamFmcWJmcmN4a2Rma2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNTAwODQsImV4cCI6MjA3MzkyNjA4NH0.PHZV8n3P91Ssx3Jg2KR-BfQ-e8-rm3LAArJb_6NkxyA' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1d2FqamFmcWJmcmN4a2Rma2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNTAwODQsImV4cCI6MjA3MzkyNjA4NH0.PHZV8n3P91Ssx3Jg2KR-BfQ-e8-rm3LAArJb_6NkxyA' \
  -d '{"email":"test@example.com"}'
```

## 추가 정보

- **Supabase Anon Key**: 공개 키이므로 프론트엔드에서 사용해도 안전합니다.
- **Service Key**: 서버에서만 사용해야 하는 비밀 키입니다.
- **CORS**: 현재 `https://www.teamitaka.com`에서의 요청만 허용됩니다.

## 확인 사항

1. 프론트엔드에서 `Authorization` 헤더가 포함되어 있는지 확인
2. `apikey` 헤더도 함께 포함되어 있는지 확인
3. CORS 설정이 올바른지 확인 (Origin: https://www.teamitaka.com)
