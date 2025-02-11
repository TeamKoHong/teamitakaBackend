const request = require("supertest");
const app = require("../index"); // ✅ 수정된 부분

beforeAll(() => {
  console.log("✅ 테스트 시작");
});

afterAll(() => {
  server.close(); // ✅ 테스트 후 서버 닫기
  console.log("✅ 테스트 완료 후 서버 종료");
});

describe("GET /", () => {
  it("✅ 서버 실행 확인", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe("Teamitaka Backend Running!");
  });
});

// ✅ 테스트 종료 후 서버 닫기
afterAll((done) => {
    server.close(done);
});