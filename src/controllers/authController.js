// controllers/authController.js

const { validatePassword } = require("../utils/passwordValidator");

// ✅ 회원가입
exports.register = (req, res) => {
  try {
    // 실제 회원가입 로직 (DB 저장 등)...
    // 아래는 데모 응답
    return res.status(200).json({ message: "User registered (fake demo)." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ✅ 로그인
exports.login = (req, res) => {
  try {
    // 실제 로그인 로직 (사용자 검증, JWT 발행 등)...
    // 아래는 데모 응답
    return res.status(200).json({ token: "fake-jwt-token" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ✅ 비밀번호 검증
exports.validatePassword = (req, res) => {
  const { password } = req.body;
  const validationResult = validatePassword(password);
  return res.json(validationResult);
};
