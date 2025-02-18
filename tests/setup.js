jest.mock("../src/config/db", () => ({
  connectDB: jest.fn(() => console.log("🚀 Mocking DB Connection (Disabled)")),
  sequelize: {
    authenticate: jest.fn(() => console.log("🚀 Mocking DB Authentication (Disabled)")),
    close: jest.fn(() => console.log("🛑 Closing Mock DB")),
  },
}));
