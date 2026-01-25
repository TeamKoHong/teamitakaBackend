const axios = require("axios");
const { VerifiedEmail } = require("../models");

const UNIVCERT_API_KEY = process.env.UNIVCERT_API_KEY;

// 📌 인증 가능한 학교 이메일 도메인
const universityMap = {
    "korea.ac.kr": "고려대학교",
    "g.hongik.ac.kr": "홍익대학교"
};

// ✅ 이메일 인증 코드 발송
exports.sendVerificationCode = async (email) => {
    const emailDomain = email.split("@")[1];

    // ✅ 허용된 이메일 도메인인지 확인
    if (!universityMap[emailDomain]) {
        throw new Error("지원되지 않는 학교 이메일입니다.");
    }

    try {
        const response = await axios.post("https://univcert.com/api/v1/certify", {
            key: UNIVCERT_API_KEY,
            email: email,
            univName: universityMap[emailDomain], // ✅ 자동 설정
            univ_check: true, // 대학 재학 여부 확인
        });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        return { message: "인증 코드가 이메일로 전송되었습니다." };
    } catch (error) {
        console.error("🚨 UnivCert API 응답 오류:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "인증 코드 전송 실패");
    }
};

// ✅ 이메일 인증 코드 검증
exports.verifyCode = async (email, code) => {
    const emailDomain = email.split("@")[1];

    // ✅ 허용된 이메일 도메인인지 확인
    if (!universityMap[emailDomain]) {
        throw new Error("지원되지 않는 학교 이메일입니다.");
    }

    try {
        const response = await axios.post("https://univcert.com/api/v1/certifycode", {
            key: UNIVCERT_API_KEY,
            email: email,
            univName: universityMap[emailDomain],
            code: parseInt(code),
        });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        // ✅ 인증된 이메일을 저장 또는 갱신
        await VerifiedEmail.upsert({
            email: response.data.certified_email,
            certified_date: response.data.certified_date,
        });

        return {
            message: "이메일 인증 완료",
            certified_email: response.data.certified_email,
            certified_date: response.data.certified_date,
        };
    } catch (error) {
        console.error("🚨 UnivCert API 응답 오류:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "이메일 인증 실패");
    }
};
