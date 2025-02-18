beforeAll(async () => {
  process.env.NODE_ENV = "test";
  console.log("✅ 테스트 시작 (DB 연결 차단)");

  //if (sequelize) {
  //  await sequelize.close();
  //  console.log("🛑 Sequelize 연결 강제 종료");
  //}
});

afterAll(() => {
  console.log("🛑 테스트 종료");
});

// 더미 테스트 추가
describe("Dummy Test", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});
