require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD; // 이미 bcrypt로 해시된 값

  if (!adminEmail || !adminPassword) {
    console.error("❌ 관리자 계정 정보를 .env에 설정해야 합니다.");
    process.exit(1);
  }

  // 기존 관리자 계정이 있는지 확인
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: adminPassword, // bcrypt 해시된 값 그대로 삽입
        username: "Admin",
        role: "ADMIN", // ENUM 값 (schema.prisma에서 정의됨)
        userType: "ADMIN",
      },
    });
    console.log(`✅ 관리자 계정이 생성되었습니다: ${adminEmail}`);
  } else {
    console.log("⚡ 이미 관리자 계정이 존재합니다.");
  }
}

main()
  .catch((e) => {
    console.error("❌ 관리자 계정 생성 중 오류 발생:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
