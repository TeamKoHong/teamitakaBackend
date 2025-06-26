#!/usr/bin/env node

/**
 * 🚀 Teamitaka Backend 배포 검증 스크립트
 * 완벽한 배포 상태를 확인하는 종합 테스트
 */

const axios = require('axios');
require('colors');

// 환경 설정
const BASE_URL = process.env.API_BASE_URL || 'https://teamitaka-backend-zwe2nuc5ga-uc.a.run.app';
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';
const TEST_PROJECT_ID = '00000000-0000-0000-0000-000000000003';

// 테스트 결과 저장
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// 유틸리티 함수들
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`.blue),
  success: (msg) => console.log(`✅ ${msg}`.green),
  error: (msg) => console.log(`❌ ${msg}`.red),
  warning: (msg) => console.log(`⚠️  ${msg}`.yellow),
  header: (msg) => console.log(`\n🔍 ${msg}`.cyan.bold)
};

const addResult = (testName, passed, details = '') => {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log.success(`${testName}: PASSED`);
  } else {
    testResults.failed++;
    log.error(`${testName}: FAILED - ${details}`);
  }
  testResults.details.push({ name: testName, passed, details });
};

// 1. 기본 연결성 테스트
async function testBasicConnectivity() {
  log.header('1. 기본 연결성 테스트');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/health`, { timeout: 10000 });
    addResult('Health Check', response.status === 200, `Status: ${response.status}`);
  } catch (error) {
    addResult('Health Check', false, error.message);
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/projects`, { timeout: 10000 });
    addResult('Projects API', response.status === 200, `Found ${response.data.length} projects`);
  } catch (error) {
    addResult('Projects API', false, error.message);
  }
}

// 2. 인증 시스템 테스트
async function testAuthentication() {
  log.header('2. 인증 시스템 테스트');
  
  // 로그인 테스트
  try {
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'password'
    }, { timeout: 10000 });
    
    const hasToken = loginResponse.data.token || loginResponse.data.accessToken;
    addResult('Login API', loginResponse.status === 200 && hasToken, 
      hasToken ? 'Token received' : 'No token in response');
    
    return hasToken ? loginResponse.data.token || loginResponse.data.accessToken : null;
  } catch (error) {
    addResult('Login API', false, error.response?.data?.message || error.message);
    return null;
  }
}

// 3. 데이터베이스 연결 및 데이터 무결성 테스트
async function testDatabaseIntegrity() {
  log.header('3. 데이터베이스 무결성 테스트');
  
  // 사용자 데이터 확인
  try {
    const usersResponse = await axios.get(`${BASE_URL}/api/user`, { timeout: 10000 });
    const hasUsers = usersResponse.data && usersResponse.data.length > 0;
    addResult('Users Data', hasUsers, `Found ${usersResponse.data.length} users`);
  } catch (error) {
    addResult('Users Data', false, error.message);
  }
  
  // 프로젝트 데이터 확인
  try {
    const projectsResponse = await axios.get(`${BASE_URL}/api/projects`, { timeout: 10000 });
    const hasProjects = projectsResponse.data && projectsResponse.data.length > 0;
    addResult('Projects Data', hasProjects, `Found ${projectsResponse.data.length} projects`);
  } catch (error) {
    addResult('Projects Data', false, error.message);
  }
  
  // 특정 사용자 프로필 확인
  try {
    const profileResponse = await axios.get(`${BASE_URL}/api/profile/${TEST_USER_ID}`, { timeout: 10000 });
    const hasProfile = profileResponse.data && profileResponse.data.username;
    addResult('User Profile', hasProfile, `Username: ${profileResponse.data.username}`);
  } catch (error) {
    addResult('User Profile', false, error.message);
  }
}

// 4. API 엔드포인트 기능 테스트
async function testAPIEndpoints() {
  log.header('4. API 엔드포인트 기능 테스트');
  
  // 댓글 API
  try {
    const commentsResponse = await axios.get(`${BASE_URL}/api/comments`, { timeout: 10000 });
    const hasComments = commentsResponse.data && Array.isArray(commentsResponse.data);
    addResult('Comments API', hasComments, `Found ${commentsResponse.data.length} comments`);
  } catch (error) {
    addResult('Comments API', false, error.message);
  }
  
  // 지원서 API
  try {
    const applicationsResponse = await axios.get(`${BASE_URL}/api/applications`, { timeout: 10000 });
    const hasApplications = applicationsResponse.data && Array.isArray(applicationsResponse.data);
    addResult('Applications API', hasApplications, `Found ${applicationsResponse.data.length} applications`);
  } catch (error) {
    addResult('Applications API', false, error.message);
  }
  
  // 리뷰 API
  try {
    const reviewsResponse = await axios.get(`${BASE_URL}/api/reviews`, { timeout: 10000 });
    const hasReviews = reviewsResponse.data && Array.isArray(reviewsResponse.data);
    addResult('Reviews API', hasReviews, `Found ${reviewsResponse.data.length} reviews`);
  } catch (error) {
    addResult('Reviews API', false, error.message);
  }
}

// 5. 관계형 데이터 테스트
async function testRelationalData() {
  log.header('5. 관계형 데이터 테스트');
  
  // 프로젝트 상세 정보 (관계 포함)
  try {
    const projectDetailResponse = await axios.get(`${BASE_URL}/api/projects/${TEST_PROJECT_ID}`, { timeout: 10000 });
    const project = projectDetailResponse.data;
    
    const hasUser = project.User && project.User.username;
    const hasRecruitment = project.Recruitment && project.Recruitment.title;
    const hasMembers = project.ProjectMembers && Array.isArray(project.ProjectMembers);
    
    addResult('Project Relations', hasUser && hasRecruitment, 
      `User: ${hasUser}, Recruitment: ${hasRecruitment}, Members: ${hasMembers ? project.ProjectMembers.length : 0}`);
  } catch (error) {
    addResult('Project Relations', false, error.message);
  }
  
  // 댓글 관계 데이터
  try {
    const commentsResponse = await axios.get(`${BASE_URL}/api/comments`, { timeout: 10000 });
    const comments = commentsResponse.data;
    const hasUserInComments = comments.length > 0 && comments[0].User && comments[0].User.username;
    addResult('Comment Relations', hasUserInComments, 
      hasUserInComments ? `User: ${comments[0].User.username}` : 'No user data in comments');
  } catch (error) {
    addResult('Comment Relations', false, error.message);
  }
}

// 6. 성능 테스트
async function testPerformance() {
  log.header('6. 성능 테스트');
  
  const startTime = Date.now();
  try {
    await axios.get(`${BASE_URL}/api/projects`, { timeout: 15000 });
    const responseTime = Date.now() - startTime;
    const isFast = responseTime < 3000; // 3초 이내
    addResult('Response Time', isFast, `${responseTime}ms`);
  } catch (error) {
    addResult('Response Time', false, error.message);
  }
}

// 7. 보안 테스트
async function testSecurity() {
  log.header('7. 보안 테스트');
  
  // 인증되지 않은 접근 테스트
  try {
    await axios.get(`${BASE_URL}/api/profile/${TEST_USER_ID}`, { timeout: 10000 });
    addResult('Unauthorized Access', false, 'Should require authentication');
  } catch (error) {
    const isUnauthorized = error.response && error.response.status === 401;
    addResult('Unauthorized Access', isUnauthorized, 
      isUnauthorized ? 'Properly blocked' : `Unexpected status: ${error.response?.status}`);
  }
  
  // 잘못된 토큰 테스트
  try {
    await axios.get(`${BASE_URL}/api/profile/${TEST_USER_ID}`, {
      headers: { 'Authorization': 'Bearer invalid-token' },
      timeout: 10000
    });
    addResult('Invalid Token', false, 'Should reject invalid token');
  } catch (error) {
    const isForbidden = error.response && error.response.status === 403;
    addResult('Invalid Token', isForbidden, 
      isForbidden ? 'Properly rejected' : `Unexpected status: ${error.response?.status}`);
  }
}

// 8. 에러 핸들링 테스트
async function testErrorHandling() {
  log.header('8. 에러 핸들링 테스트');
  
  // 존재하지 않는 리소스
  try {
    await axios.get(`${BASE_URL}/api/projects/non-existent-id`, { timeout: 10000 });
    addResult('404 Handling', false, 'Should return 404');
  } catch (error) {
    const isNotFound = error.response && error.response.status === 404;
    addResult('404 Handling', isNotFound, 
      isNotFound ? 'Proper 404 response' : `Unexpected status: ${error.response?.status}`);
  }
  
  // 잘못된 요청 형식
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'invalid-email',
      password: ''
    }, { timeout: 10000 });
    addResult('Validation Error', false, 'Should validate input');
  } catch (error) {
    const isBadRequest = error.response && error.response.status === 400;
    addResult('Validation Error', isBadRequest, 
      isBadRequest ? 'Proper validation' : `Unexpected status: ${error.response?.status}`);
  }
}

// 메인 실행 함수
async function runAllTests() {
  console.log('\n🚀 Teamitaka Backend 배포 검증 시작'.bold.cyan);
  console.log(`📍 Target URL: ${BASE_URL}\n`);
  
  try {
    await testBasicConnectivity();
    await testAuthentication();
    await testDatabaseIntegrity();
    await testAPIEndpoints();
    await testRelationalData();
    await testPerformance();
    await testSecurity();
    await testErrorHandling();
    
    // 결과 요약
    log.header('📊 최종 검증 결과');
    console.log(`총 테스트: ${testResults.total}`.bold);
    console.log(`✅ 성공: ${testResults.passed}`.green.bold);
    console.log(`❌ 실패: ${testResults.failed}`.red.bold);
    console.log(`📈 성공률: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`.cyan.bold);
    
    if (testResults.failed === 0) {
      log.success('🎉 모든 테스트 통과! 배포가 완벽합니다!');
      process.exit(0);
    } else {
      log.warning('⚠️  일부 테스트 실패. 배포 상태를 확인해주세요.');
      console.log('\n📋 실패한 테스트들:');
      testResults.details
        .filter(test => !test.passed)
        .forEach(test => log.error(`- ${test.name}: ${test.details}`));
      process.exit(1);
    }
    
  } catch (error) {
    log.error(`테스트 실행 중 오류 발생: ${error.message}`);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, testResults }; 