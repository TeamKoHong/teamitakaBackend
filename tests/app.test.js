const request = require("supertest");
const app = require("../src/app");
const { sequelize } = require("../src/config/db");

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  console.log("✅ 테스트 시작 (DB 연결 우회)");

  // ✅ Sequelize 연결 강제 종료 (CI 환경에서 DB 연결을 막기 위함)
  if (sequelize) {
    await sequelize.close();
    console.log("🛑 Sequelize 연결 종료 (테스트 환경)");
  }
});

afterAll(() => {
  console.log("🛑 테스트 종료");
});

describe("GET / (기본 라우트 테스트)", () => {
  it("✅ 서버 실행 확인", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe("Teamitaka Backend Running!");
  });
});
