const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log("🔑 해싱된 비밀번호:", hashedPassword);
};

// hashPassword("your-admin-password"); // 👉 실제 사용할 비밀번호 입력 후 실행
hashPassword("admin-password@!")