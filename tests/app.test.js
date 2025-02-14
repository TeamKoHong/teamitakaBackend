// tests/app.test.js
const request = require("supertest");
const app = require("../src/app");

beforeAll(() => {
  console.log("✅ 테스트 시작");
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

// 필요하면 admin, auth, dev, univcert, user 라우트에 대한 테스트도 추가
/*
describe("Admin Routes", () => {
  it("should handle POST /admin/login", async () => {
    // ...
  });
});
*/
