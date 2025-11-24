const admin = require('firebase-admin');

/**
 * Firebase Admin SDK 초기화
 *
 * 환경변수 요구사항:
 * - FIREBASE_PROJECT_ID: Firebase 프로젝트 ID
 * - FIREBASE_PRIVATE_KEY: Firebase 서비스 계정 Private Key
 * - FIREBASE_CLIENT_EMAIL: Firebase 서비스 계정 이메일
 */

let firebaseAdmin = null;

try {
  // 환경변수 검증
  const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL) {
    console.warn('⚠️  Firebase Admin 환경변수가 설정되지 않았습니다. 전화번호 인증 기능이 비활성화됩니다.');
  } else {
    // Private Key 포맷 처리 (\n 문자열을 실제 줄바꿈으로 변환)
    const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

    // Firebase Admin SDK 초기화
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: FIREBASE_CLIENT_EMAIL,
      }),
    });

    console.log('✅ Firebase Admin SDK 초기화 완료');
  }
} catch (error) {
  console.error('❌ Firebase Admin SDK 초기화 실패:', error.message);
  console.warn('⚠️  전화번호 인증 기능이 비활성화됩니다.');
}

/**
 * Firebase Admin Auth 인스턴스 가져오기
 * @returns {admin.auth.Auth | null}
 */
const getAuth = () => {
  if (!firebaseAdmin) {
    return null;
  }
  return admin.auth();
};

/**
 * Firebase 전화번호 인증 토큰 검증
 * @param {string} idToken - Firebase ID Token
 * @returns {Promise<admin.auth.DecodedIdToken>}
 */
const verifyIdToken = async (idToken) => {
  // 🧪 개발 환경: 테스트 토큰 허용
  if (process.env.NODE_ENV === 'development' && idToken.startsWith('dev-test-token-')) {
    console.log('🧪 [DEV MODE] 테스트 토큰 감지:', idToken);
    console.log('🧪 [DEV MODE] Firebase 검증 건너뛰고 테스트 사용자 반환');

    // 테스트용 고정 데이터 반환 (DecodedIdToken 형식)
    return {
      uid: `test-user-uid-${Date.now()}`,
      phone_number: '+821012345678',
      auth_time: Math.floor(Date.now() / 1000),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      firebase: {
        sign_in_provider: 'phone',
        identities: {
          phone: ['+821012345678']
        }
      }
    };
  }

  // 프로덕션 환경: 실제 Firebase ID Token 검증
  const auth = getAuth();
  if (!auth) {
    throw new Error('Firebase Admin이 초기화되지 않았습니다.');
  }

  const decodedToken = await auth.verifyIdToken(idToken);
  console.log('✅ Firebase ID Token 검증 성공');
  return decodedToken;
};

/**
 * UID로 사용자 정보 가져오기
 * @param {string} uid - Firebase UID
 * @returns {Promise<admin.auth.UserRecord>}
 */
const getUserByUid = async (uid) => {
  const auth = getAuth();
  if (!auth) {
    throw new Error('Firebase Admin이 초기화되지 않았습니다.');
  }
  return await auth.getUser(uid);
};

module.exports = {
  admin: firebaseAdmin,
  getAuth,
  verifyIdToken,
  getUserByUid,
};
