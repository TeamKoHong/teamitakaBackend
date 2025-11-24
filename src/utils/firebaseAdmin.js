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
  const auth = getAuth();
  if (!auth) {
    throw new Error('Firebase Admin이 초기화되지 않았습니다.');
  }
  return await auth.verifyIdToken(idToken);
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
