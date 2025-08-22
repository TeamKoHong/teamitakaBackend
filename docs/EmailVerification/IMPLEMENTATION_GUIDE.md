# 이메일 인증 구현 가이드라인 (Domain-agnostic)

본 문서는 “도메인 구분 없이” 어디로든 안정적으로 도달하는 이메일 인증(매직링크 + 6자리 코드 백업) 구현의 의사결정과 실행 절차를 정리합니다. 코드 변경 없이 설계·운영 기준만 다룹니다.

---

## 1. 구현 옵션 평가(요약)
- 완전관리형 전송 서비스(API/SMTP)
  - 후보: AWS SES(권장), Postmark, Mailgun, Resend, SendGrid
  - 장점: 높은 도달률, 이벤트/바운스 웹훅, 템플릿, 통계, IP 평판 관리
  - 비용/스케일: SES 가장 유리, Postmark는 트랜잭션 특화
- 자체 SMTP(MTA)
  - IP 평판·스팸튜닝·보안패치 부담 큼 → 인증용 트랜잭션 메일엔 비권장
- 권장 결론(하이브리드)
  - Primary: SES(API)
  - Fallback: SMTP 릴레이(Resend/SendGrid 등)

## 2. 필수 전달성 세팅
- SPF/DKIM/DMARC(도메인 서명)
  - SES는 Easy DKIM(2048bit) 지원
  - DMARC: p=none로 시작 → 안정화 후 quarantine/reject로 상향
- MX 존재 검증(소프트 필터) + (옵션) Validation API로 1회용/리스크 도메인만 소프트 차단
- 전송 도메인 분리 권장: auth.example.com (마케팅과 평판 분리)

## 3. 인증 UX 패턴(권장)
- 매직링크(15분 TTL, 1회성) + 6자리 코드 백업 동시 제공
- 재전송 쿨다운 30–60초, 실패/만료 상황에 친절한 안내
- 국문/영문 템플릿 병기

## 4. 레퍼런스 아키텍처
- 메일 전송: SES API → 실패 시 SMTP 폴백(Nodemailer)
- 토큰 전략: JWS 서명된 매직링크 + Redis 단일사용 락 + DB 해시 저장
- 이벤트: SES Event Destinations/SNS로 바운스/컴플레인 수집 → 억제리스트 관리

## 5. 데이터 모델(예시)
- users(id, email, email_verified_at, ...)
- email_verifications(id UUID, email, jti, token_hash, code_hash, purpose ENUM('signup','login','change'), expires_at, consumed_at, sent_provider, created_ip, ua)
- 인덱스: (email, purpose, consumed_at IS NULL)

원칙
- 토큰/코드는 평문 저장 금지(해시 보관)
- Redis 키 `email:vfy:{jti}` 로 단일 사용 보장(TTL=15m)

## 6. 보안/리밋 정책
- 레이트리밋: IP+email 5/15min, 실패 누적 시 지수 백오프
- 오픈 리다이렉트 방지: 화이트리스트된 경로만 리다이렉트 허용
- 로깅 마스킹: 이메일 `abc***@***`, 토큰 접두부만 저장
- 바운스/컴플레인: 자동 억제 리스트 반영

## 7. 운영 체크리스트
- DNS: SPF/DKIM/DMARC 설정
- 이벤트 수집: Bounce/Complaint/Delivery 지표 대시보드화
- 템플릿: 다크모드/접근성/단일 CTA/텍스트 파트 동봉
- 관측성: 전송ID, 제공자, 소요시간, 실패 사유 로깅

## 8. 구현 루트 선택 가이드
- Firebase 단독(가장 빠름)
  - 콘솔에서 Email 인증/Email Link 활성화, 템플릿 편집, 커스텀 액션 URL 설정
  - 한계: From 주소/도달성/대량 운영 제약
- 하이브리드(권장)
  - Firebase Admin SDK로 액션 링크 생성 → 외부 전송(SES/Postmark)
  - 장점: 브랜드 From, 도메인 서명, 바운스/분석/확장성 확보

## 9. 승인 기준(이 문서 기준)
- 전송 벤더 결정(SES 주력 + SMTP 폴백 여부)
- DNS 세팅 계획(SPF/DKIM/DMARC) 수립
- UX(매직링크+코드), 레이트리밋, 로깅/마스킹 정책 합의
- 이벤트/억제리스트 운영 방안 정의

---

## 한국어 템플릿/카피 가이드(샘플)
- 제목: "이메일 주소를 확인해주세요"
- 본문(요약):
  - 버튼: "인증하기"
  - 부가: "버튼이 동작하지 않으면 아래 링크를 복사해 브라우저에 붙여넣기"
  - 코드: "앱에서 아래 인증 코드를 입력하세요: 123456"

## 링크 처리 가이드(프론트엔드)
- 커스텀 핸들러 페이지 `/verify`
  - 쿼리 파라미터(예: token, sig 또는 Firebase의 oobCode) 파싱
  - 검증 완료 시 `router.replace('/')`로 메인 리다이렉트

## 시크릿/환경 변수 스키마(예)
- 전송
  - PRIMARY_FROM=TEAMITAKA <no-reply@auth.example.com>
  - AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
  - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- 토큰
  - JWT_SECRET
  - APP_BASE_URL=https://app.example.com
- 플래그
  - EMAIL_VERIFICATION_ENABLED=true

