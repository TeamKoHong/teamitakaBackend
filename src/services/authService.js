const { validatePassword } = require("../utils/passwordValidator");

exports.registerUser = async (email, password) => {
    // 비밀번호 검증
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
        throw new Error(passwordCheck.message);
    }

    // 이후 회원가입 로직 진행 (예: DB 저장, JWT 생성 등)
};
