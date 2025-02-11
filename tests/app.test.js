const request = require("supertest");
const app = require("../index"); // ✅ 수정된 부분

beforeAll(() => {
  console.log("✅ 테스트 시작");
});

describe("GET /", () => {
  it("✅ 서버 실행 확인", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe("Teamitaka Backend Running!");
  });
});
