/**
 * 대학교 이메일 도메인 검증 유틸리티
 */

const ALLOWED_DOMAIN_SUFFIXES = ['.ac.kr', '.edu'];

/**
 * 대학교 이메일인지 검증
 * @param {string} email - 검증할 이메일 주소
 * @returns {boolean} 대학교 이메일 여부
 */
const isUniversityEmail = (email) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return false;
  }
  const domain = email.split('@')[1].toLowerCase();
  return ALLOWED_DOMAIN_SUFFIXES.some(suffix => domain.endsWith(suffix));
};

module.exports = { isUniversityEmail, ALLOWED_DOMAIN_SUFFIXES };
