// src/scripts/setupAdmin.js
const bcrypt = require("bcryptjs");
const { Admin } = require("../models");
require("dotenv").config();

const setupAdminAccount = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("❌ ADMIN_EMAIL 또는 ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.");
      return;
    }

    const existingAdmin = await Admin.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await Admin.create({ email: adminEmail, password: hashedPassword, role: "ADMIN" });
      console.log("✅ 기본 관리자 계정이 생성되었습니다.");
    } else {
      console.log("✅ 기본 관리자 계정이 이미 존재합니다.");
    }
  } catch (error) {
    console.error("🚨 관리자 계정 생성 중 오류 발생:", error);
  }
};

// 직접 실행할 경우에만 작동
if (require.main === module) {
  setupAdminAccount();
}

module.exports = setupAdminAccount;
