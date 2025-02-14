const { VerifiedEmail } = require("../models");

// ✅ 인증된 이메일 전체 삭제 (개발용)
exports.clearVerifiedEmails = async (req, res) => {
    try {
        await VerifiedEmail.destroy({ where: {} }); // 전체 삭제
        res.status(200).json({ message: "✅ 모든 인증된 이메일이 삭제되었습니다." });
    } catch (error) {
        console.error("🚨 인증된 이메일 삭제 오류:", error.message);
        res.status(500).json({ error: "서버 오류: 인증된 이메일을 삭제하지 못했습니다." });
    }
};
