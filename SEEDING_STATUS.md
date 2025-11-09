# 테스트 데이터 Seeding 현황

## ✅ 완료된 작업

### 1. Users Seeder (성공)
- **파일**: `src/seeders/20251109-01-demo-users.js`
- **생성된 데이터**: 10명의 테스트 사용자
- **포함 정보**:
  - 이메일 인증 완료 (email_verified_at 설정)
  - 다양한 대학교 (고려대, 홍익대, 연세대, 서울대, 한양대, KAIST, POSTECH, 성균관대)
  - 다양한 전공
  - 자기소개 (bio)
  - 보유 스킬 (skills)

### 테스트 계정 정보
- **이메일**: testuser1-10@{대학교도메인}
  - testuser1@korea.ac.kr
  - testuser2@g.hongik.ac.kr
  - testuser3@yonsei.ac.kr
  - testuser4@snu.ac.kr
  - testuser5@hanyang.ac.kr
  - testuser6@kaist.ac.kr
  - testuser7@skku.edu
  - testuser8@postech.ac.kr
  - testuser9@korea.ac.kr
  - testuser10@g.hongik.ac.kr
- **사용자명**: testuser1-10
- **비밀번호**: Test1234!

## ⚠️ 발견된 문제

### 데이터베이스 스키마 불일치

현재 데이터베이스 스키마가 초기 가정했던 구조와 상당히 다릅니다:

#### **Recruitments 테이블**
**실제 스키마**:
- recruitment_id (PK)
- title
- description
- status (OPEN/CLOSED)
- user_id (FK)
- photo
- views
- createdAt/updatedAt

**누락된 필드**:
- required_skills (필수 스킬)
- preferred_skills (우대 스킬)
- max_members (최대 인원)
- current_members (현재 인원)
- deadline (마감일)

#### **Projects 테이블**
**실제 스키마**:
- project_id (PK)
- title
- description
- user_id (FK)
- recruitment_id (FK)
- start_date
- end_date
- status (예정/진행 중/완료)
- role
- createdAt/updatedAt

**누락된 필드**:
- name → title로 대체됨
- repository_url
- meeting_link

#### **Applications 테이블**
**실제 스키마**:
- application_id (PK)
- status (PENDING/APPROVED/REJECTED)
- user_id (FK)
- recruitment_id (FK)
- createdAt/updatedAt

**누락된 필드**:
- motivation (지원 동기)
- applied_at (지원 날짜)

#### **Project_Members 테이블**
**상태**: ❌ 테이블이 존재하지 않음

## 📋 수정이 필요한 Seeder 파일

1. `src/seeders/20251109-02-demo-recruitments.js` - 스키마 맞춤 필요
2. `src/seeders/20251109-03-demo-projects.js` - 스키마 맞춤 필요
3. `src/seeders/20251109-04-demo-applications.js` - 스키마 맞춤 필요
4. `src/seeders/20251109-05-demo-project-members.js` - 테이블 없음 (삭제 권장)

## 🔧 진행 방법

### 옵션 1: 간소화된 Seeder 생성
현재 스키마에 맞춰 간단한 테스트 데이터만 생성:
- Recruitments: 제목, 설명, 상태만 포함
- Projects: 기본 정보만 포함  
- Applications: 최소 필드만 포함

### 옵션 2: 스키마 확장
데이터베이스 마이그레이션을 통해 필요한 필드 추가:
- Recruitments 테이블에 스킬 관련 필드 추가
- Applications 테이블에 지원 동기 필드 추가
- Projects 테이블에 링크 필드 추가
- Project_Members 테이블 생성

## 🚀 Seeder 실행 방법

### 개발 환경
```bash
# 사용자 데이터만 생성 (현재 작동 중)
NODE_ENV=development node run-seeders.js

# 또는 sequelize-cli 사용
npm run seed:dev
```

### 데이터 삭제 (Rollback)
```bash
NODE_ENV=development node -e "
const { sequelize } = require('./src/models');
sequelize.query('DELETE FROM users WHERE email LIKE \"testuser%\"')
  .then(() => { console.log('✅ 테스트 데이터 삭제 완료'); return sequelize.close(); });
"
```

## 📝 생성된 파일

- `.sequelizerc` - Sequelize CLI 설정
- `run-seeders.js` - 수동 seeder 실행 스크립트
- `src/seeders/20251109-01-demo-users.js` - 사용자 seeder (완료)
- `src/seeders/20251109-02-demo-recruitments.js` - 모집글 seeder (수정 필요)
- `src/seeders/20251109-03-demo-projects.js` - 프로젝트 seeder (수정 필요)
- `src/seeders/20251109-04-demo-applications.js` - 지원서 seeder (수정 필요)
- `src/seeders/20251109-05-demo-project-members.js` - 프로젝트 멤버 seeder (삭제 권장)

## 💡 권장사항

**짧은 기간 내 프론트엔드 테스트가 필요한 경우**:
1. 현재 스키마에 맞춰 간소화된 seeder 작성
2. 필수 필드만 포함하여 빠르게 테스트 데이터 생성

**장기적으로 완전한 테스트 환경이 필요한 경우**:
1. 데이터베이스 스키마 확장 (마이그레이션 작성)
2. 전체 필드를 포함한 seeder 작성
3. 프론트엔드/백엔드 모두에서 활용 가능한 풍부한 테스트 데이터 확보
