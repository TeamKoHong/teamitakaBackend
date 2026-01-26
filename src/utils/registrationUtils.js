/**
 * 회원가입 관련 유틸리티 함수
 */

/**
 * 주민번호 앞 7자리 파싱 (YYMMDD + 성별코드)
 * @param {string} residentNumber - "9901011" 형식 (7자리)
 * @returns {{ birthDate: string | null, gender: string | null }}
 *
 * 성별코드:
 * - 1, 3: 남성 (1: 1900년대 출생, 3: 2000년대 출생)
 * - 2, 4: 여성 (2: 1900년대 출생, 4: 2000년대 출생)
 */
exports.parseResidentNumber = (residentNumber) => {
  if (!residentNumber || residentNumber.length !== 7) {
    return { birthDate: null, gender: null };
  }

  // YYMMDD 추출
  const yy = residentNumber.substring(0, 2);
  const mm = residentNumber.substring(2, 4);
  const dd = residentNumber.substring(4, 6);
  const genderCode = residentNumber.charAt(6);

  // 성별 및 세기 판단
  let century;
  let gender;

  switch (genderCode) {
    case '1': // 1900년대 남성
      century = '19';
      gender = 'male';
      break;
    case '2': // 1900년대 여성
      century = '19';
      gender = 'female';
      break;
    case '3': // 2000년대 남성
      century = '20';
      gender = 'male';
      break;
    case '4': // 2000년대 여성
      century = '20';
      gender = 'female';
      break;
    default:
      return { birthDate: null, gender: null };
  }

  // YYYY-MM-DD 형식 생성
  const birthDate = `${century}${yy}-${mm}-${dd}`;

  // 유효한 날짜인지 검증
  const dateObj = new Date(birthDate);
  if (isNaN(dateObj.getTime())) {
    return { birthDate: null, gender: null };
  }

  return { birthDate, gender };
};

/**
 * 전화번호 정규화 (다양한 형식 → E.164 형식)
 * @param {string} phoneNumber - "010-1234-5678", "01012345678", "+821012345678" 등
 * @returns {string | null} - E.164 형식 "+821012345678" 또는 null
 *
 * 지원 입력 형식:
 * - 010-1234-5678
 * - 01012345678
 * - +82-10-1234-5678
 * - +821012345678
 * - 82-10-1234-5678
 */
exports.formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) {
    return null;
  }

  // 모든 하이픈, 공백, 괄호 제거
  let normalized = phoneNumber.replace(/[-\s()]/g, '');

  // +82로 시작하는 경우
  if (normalized.startsWith('+82')) {
    normalized = normalized.substring(3);
  }
  // 82로 시작하는 경우
  else if (normalized.startsWith('82')) {
    normalized = normalized.substring(2);
  }

  // 0으로 시작하지 않으면 0 추가
  if (!normalized.startsWith('0')) {
    normalized = '0' + normalized;
  }

  // 한국 휴대폰 번호 형식 검증 (010, 011, 016, 017, 018, 019)
  const phoneRegex = /^01[0-9]\d{7,8}$/;
  if (!phoneRegex.test(normalized)) {
    return null;
  }

  // E.164 형식으로 변환 (+82 + 0 제외한 번호)
  return '+82' + normalized.substring(1);
};

/**
 * 전화번호 형식 검증
 * @param {string} phoneNumber - 전화번호
 * @returns {boolean}
 */
exports.validatePhoneNumber = (phoneNumber) => {
  const formatted = exports.formatPhoneNumber(phoneNumber);
  return formatted !== null;
};

/**
 * 이메일 형식 검증 (학교 이메일 포함)
 * @param {string} email - 이메일 주소
 * @returns {boolean}
 */
exports.validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
