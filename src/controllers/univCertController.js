require("dotenv").config();
const axios = require("axios");

// ✅ 이메일 도메인 기반으로 대학명 자동 설정
const universityDomains = {
  "korea.ac.kr": "고려대학교",
  "g.hongik.ac.kr": "홍익대학교",
};

exports.sendOtp = async (req, res) => {
  console.log("📩 [DEBUG] sendOtp controller called with body:", req.body);

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "이메일을 입력해주세요." });
  }

  // 📌 이메일 도메인 확인 후 대학명 설정
  const emailDomain = email.split("@")[1];
  const univName = universityDomains[emailDomain];

  if (!univName) {
    return res.status(400).json({ message: "지원되지 않는 학교 이메일입니다." });
  }

  try {
    // ✅ UnivCert API 호출
    const response = await axios.post("https://univcert.com/api/v1/certify", {
      key: process.env.UNIVCERT_API_KEY,
      email: email,
      univName: univName, // ✅ 대학명 자동 설정
      univ_check: true, // ✅ true = 해당 대학 재학 여부 체크
    });

    // ✅ UnivCert 응답 확인
    if (response.data.success) {
      console.log(`📨 [DEBUG] UnivCert OTP Sent to ${email}`);
      return res.status(200).json({ message: "OTP 전송 완료" });
    } else {
      console.error("❌ [ERROR] UnivCert OTP Failed:", response.data);
      return res.status(400).json({ message: "OTP 전송 실패", error: response.data });
    }
  } catch (error) {
    console.error("❌ [ERROR] UnivCert API 요청 실패:", error);
    return res.status(500).json({ message: "서버 오류 발생", error: error.response?.data || error.message });
  }
};


exports.verifyOtp = async (req, res) => {
  console.log("📩 [DEBUG] verifyOtp controller called with body:", req.body);

  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: "이메일과 인증코드를 입력해주세요." });
  }

  try {
    // ✅ UnivCert 인증 코드 확인 요청
    const response = await axios.post("https://univcert.com/api/v1/certifycode", {
      key: process.env.UNIVCERT_API_KEY,
      email: email,
      univName: "홍익대학교",
      code: code,
    });

    if (response.data.success) {
      console.log(`✅ [DEBUG] UnivCert 인증 성공: ${email}`);
      return res.status(200).json({
        message: "인증 성공",
        univName: response.data.univName,
        certified_email: response.data.certified_email,
        certified_date: response.data.certified_date,
      });
    } else {
      console.error("❌ [ERROR] UnivCert 인증 실패:", response.data);
      return res.status(400).json({ message: "인증 실패", error: response.data });
    }
  } catch (error) {
    console.error("❌ [ERROR] UnivCert 인증 요청 실패:", error);
    return res.status(500).json({ message: "서버 오류 발생", error: error.response?.data || error.message });
  }
};
