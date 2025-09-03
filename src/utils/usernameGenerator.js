const { User } = require('../models');
const { v4: uuidv4 } = require('uuid');

/**
 * 이메일을 기반으로 유니크한 username 생성
 * @param {string} email - 사용자 이메일
 * @returns {Promise<string>} - 생성된 유니크한 username
 */
async function generateUniqueUsername(email) {
  try {
    // 1. 기본 username 생성
    const baseUsername = sanitizeUsername(email.split('@')[0]);
    console.log(`📝 Base username extracted from ${email}: ${baseUsername}`);
    
    // 2. 유효성 검사 후 수정
    let cleanUsername = validateAndFixUsername(baseUsername);
    
    // 3. 중복 확인 및 처리
    const finalUsername = await handleDuplicateUsername(cleanUsername);
    
    console.log(`✅ Final username generated: ${finalUsername}`);
    return finalUsername;
    
  } catch (error) {
    console.error('❌ Username generation failed:', error);
    // Fallback: UUID 기반 username
    const fallbackUsername = `user_${uuidv4().slice(0, 8)}`;
    console.log(`🔄 Using fallback username: ${fallbackUsername}`);
    return fallbackUsername;
  }
}

/**
 * 이메일에서 추출한 username을 정제
 * @param {string} rawUsername - 정제할 username
 * @returns {string} - 정제된 username
 */
function sanitizeUsername(rawUsername) {
  return rawUsername
    .toLowerCase() // 소문자 변환
    .replace(/[^a-z0-9_]/g, '_') // 특수문자를 언더스코어로 변환
    .replace(/_{2,}/g, '_') // 연속 언더스코어를 하나로
    .replace(/^_+|_+$/g, '') // 앞뒤 언더스코어 제거
    .slice(0, 20); // 최대 20자로 제한
}

/**
 * Username 유효성 검사 및 수정
 * @param {string} username - 검사할 username
 * @returns {string} - 수정된 username
 */
function validateAndFixUsername(username) {
  // 최소 길이 확보
  if (username.length < 3) {
    username = username.padEnd(3, '0');
  }
  
  // 숫자로 시작하면 앞에 'u' 추가
  if (/^\d/.test(username)) {
    username = 'u' + username;
  }
  
  // 빈 문자열이면 기본값
  if (!username || username === '') {
    username = 'user';
  }
  
  return username.slice(0, 20); // 최대 20자 제한
}

/**
 * Username 중복 확인 및 처리
 * @param {string} baseUsername - 기본 username
 * @returns {Promise<string>} - 유니크한 username
 */
async function handleDuplicateUsername(baseUsername) {
  const maxAttempts = 100;
  
  // 기본 username 먼저 확인
  if (!(await isUsernameExists(baseUsername))) {
    return baseUsername;
  }
  
  // 중복인 경우 숫자 suffix 추가
  for (let i = 1; i <= maxAttempts; i++) {
    const candidateUsername = `${baseUsername}_${i}`;
    
    if (!(await isUsernameExists(candidateUsername))) {
      console.log(`🔄 Username collision resolved: ${baseUsername} → ${candidateUsername}`);
      return candidateUsername;
    }
  }
  
  // 최대 시도 횟수 초과 시 UUID 기반 fallback
  const fallbackUsername = `user_${uuidv4().slice(0, 8)}`;
  console.warn(`⚠️ Max attempts reached for ${baseUsername}, using fallback: ${fallbackUsername}`);
  return fallbackUsername;
}

/**
 * Username이 이미 존재하는지 확인
 * @param {string} username - 확인할 username
 * @returns {Promise<boolean>} - 존재 여부
 */
async function isUsernameExists(username) {
  try {
    const existingUser = await User.findOne({ 
      where: { username },
      attributes: ['user_id'] // 성능 최적화
    });
    return !!existingUser;
  } catch (error) {
    console.error('❌ Username existence check failed:', error);
    return false; // 에러 시 중복 없다고 가정 (안전한 쪽으로)
  }
}

module.exports = {
  generateUniqueUsername,
  sanitizeUsername,
  validateAndFixUsername,
  isUsernameExists
};