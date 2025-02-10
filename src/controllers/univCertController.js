const univCertService = require("../services/univCertService");

// 이메일 인증 코드 전송
exports.sendVerificationCode = async (req, res) => {
  try {
    console.log("📩 요청된 이메일:", req.body); // 🚨 요청 데이터 확인

    const { email } = req.body;
    const response = await univCertService.sendVerificationCode(email);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 인증 코드 검증
exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body; // ✅ code 추가
    const response = await univCertService.verifyCode(email, code); // ✅ code 전달
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
