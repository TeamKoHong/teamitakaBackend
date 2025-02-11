const request = require("supertest");
const app = require("../index"); // Express 서버 불러오기

describe("GET /", () => {
  it("✅ 서버 실행 확인", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe("Teamitaka Backend Running!");
  });
});
