jest.mock("../src/config/db", () => ({
  connectDB: jest.fn(() => console.log("🚀 Mocking DB Connection")),
  sequelize: {
    authenticate: jest.fn(() => console.log("🚀 Mocking DB Authentication")),
    close: jest.fn(() => console.log("🛑 Closing Mock DB")),
  },
}));
