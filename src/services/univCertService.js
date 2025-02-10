const axios = require("axios");

// 고려대학교 이메일 인증 코드 발송
exports.sendVerificationCode = async (email) => {
    const UNIVCERT_API_KEY = process.env.UNIVCERT_API_KEY;
    const UNIVCERT_UNIV_NAME = process.env.UNIVCERT_UNIV_NAME;

  if (!email.endsWith("@korea.ac.kr")) {
    throw new Error("고려대학교 이메일만 인증 가능합니다.");
  }

  try {
    const response = await axios.post("https://univcert.com/api/v1/certify", { // ✅ URL 확인
      key: UNIVCERT_API_KEY,
      email: email,
      univName: UNIVCERT_UNIV_NAME,
      univ_check: true, // 대학 재학 여부 확인
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return { message: "인증 코드가 이메일로 전송되었습니다." };
  } catch (error) {
    console.log("🚨 UnivCert API 응답 오류:", error.response?.data || error.message); // ✅ 오류 메시지까지 출력
  
    if (error.response) {
      // API에서 응답을 준 경우 (400, 404, 500 등 HTTP 오류)
      console.log("📢 UnivCert 응답 상태 코드:", error.response.status);
      console.log("📢 UnivCert 응답 데이터:", error.response.data);
    } else if (error.request) {
      // 요청이 전송되었으나 응답을 받지 못한 경우
      console.log("📢 UnivCert 요청 오류: 응답이 없습니다. 요청 데이터:", error.request);
    } else {
      // 요청이 보내지지도 않은 경우
      console.log("📢 UnivCert 요청 생성 오류:", error.message);
    }
  
    throw new Error(error.response?.data?.message || "인증 코드 전송 실패");
  }
  
};

// 인증 코드 검증
exports.verifyCode = async (email, code) => { // ✅ code 파라미터 추가
    const UNIVCERT_API_KEY = process.env.UNIVCERT_API_KEY;
    const UNIVCERT_UNIV_NAME = process.env.UNIVCERT_UNIV_NAME;

  if (!email.endsWith("@korea.ac.kr")) {
    throw new Error("고려대학교 이메일만 인증 가능합니다.");
  }

  try {
    const response = await axios.post("https://univcert.com/api/v1/certifycode", { // ✅ 인증 코드 검증 API 사용
      key: UNIVCERT_API_KEY,
      email: email,
      univName: UNIVCERT_UNIV_NAME,
      code: parseInt(code), // ✅ 인증 코드 전송
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return {
      message: "이메일 인증 완료",
      certified_email: response.data.certified_email,
      certified_date: response.data.certified_date,
    };
  } catch (error) {
    console.log("🚨 UnivCert API 응답 오류:", error.response?.data); // 🚨 오류 로그 추가
    throw new Error(error.response?.data?.message || "이메일 인증 실패");
  }
};
