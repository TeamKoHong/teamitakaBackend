// tests/setup.js (예시)
jest.mock("../src/config/db", () => ({
    connectDB: jest.fn(),
    sequelize: { authenticate: jest.fn() }
  }));
  