jest.mock("src/config/db", () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(),
    sync: jest.fn().mockResolvedValue(),
    define: jest.fn(),
    query: jest.fn(),
  },
  connectDB: jest.fn().mockResolvedValue(true),
}));

jest.mock("src/models", () => ({
  sequelize: {
    query: jest.fn().mockResolvedValue([]),
  },
  User: {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
  },
  EmailVerification: {
    findOne: jest.fn().mockResolvedValue(null),
  },
}));

jest.mock("src/services/smsService", () => ({
  normalizePhone: jest.fn((phone) => String(phone).replace(/[-\s]/g, "")),
  hasVerifiedPhone: jest.fn().mockReturnValue(false),
  consumeVerifiedPhone: jest.fn(),
}));

const findRouteLayer = (router, path, method) =>
  router.stack.find(
    (layer) => layer.route?.path === path && layer.route.methods?.[method]
  );

describe("Security hardening", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = "test-secret";
    process.env.CORS_ORIGIN = "http://localhost:3000";
    delete process.env.ENABLE_DEV_ROUTES;
    delete process.env.DEV_ROUTE_TOKEN;
  });

  test("dev routes are disabled by default", () => {
    const app = require("../src/app");
    const stack = app._router?.stack || app.router?.stack || [];
    const hasDevMount = stack.some(
      (layer) => layer.name === "router" && layer.regexp?.toString().includes("\\/api\\/dev")
    );

    expect(hasDevMount).toBe(false);
  });

  test("dev routes require a secondary dev route token even outside production", () => {
    process.env.ENABLE_DEV_ROUTES = "true";
    const devRoutes = require("../src/routes/devRoutes");
    const gate = devRoutes.stack[0].handle;

    const req = {
      headers: {},
      query: {},
    };
    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };
    const next = jest.fn();

    gate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(404);
  });

  test("public user list and create routes are guarded by admin middleware", () => {
    const userRoutes = require("../src/routes/userRoutes");
    const getRoot = findRouteLayer(userRoutes, "/", "get");
    const postRoot = findRouteLayer(userRoutes, "/", "post");

    expect(getRoot.route.stack[0].handle.name).toBe("adminMiddleware");
    expect(postRoot.route.stack[0].handle.name).toBe("adminMiddleware");
  });

  test("internal project read routes require auth middleware", () => {
    const projectRoutes = require("../src/routes/projectRoutes");
    const detail = findRouteLayer(projectRoutes, "/:project_id", "get");
    const timeline = findRouteLayer(projectRoutes, "/:project_id/timeline", "get");
    const members = findRouteLayer(projectRoutes, "/:project_id/members", "get");
    const meetings = findRouteLayer(projectRoutes, "/:project_id/meetings", "get");

    expect(detail.route.stack[0].handle.name).toBe("authenticateToken");
    expect(timeline.route.stack[0].handle.name).toBe("authenticateToken");
    expect(members.route.stack[0].handle.name).toBe("authenticateToken");
    expect(meetings.route.stack[0].handle.name).toBe("authenticateToken");
  });

  test("project post read routes require auth middleware", () => {
    const projectPostRoutes = require("../src/routes/projectPostRoutes");
    const listRoute = findRouteLayer(projectPostRoutes, "/:project_id/posts", "get");
    const detailRoute = findRouteLayer(projectPostRoutes, "/posts/:post_id", "get");

    expect(
      listRoute.route.stack.some((layer) => layer.handle.name === "authenticateToken")
    ).toBe(true);
    expect(
      detailRoute.route.stack.some((layer) => layer.handle.name === "authenticateToken")
    ).toBe(true);
  });

  test("review queries do not select reviewer or reviewee emails", async () => {
    const { sequelize } = require("../src/models");
    const reviewService = require("../src/services/reviewService");

    sequelize.query.mockClear();
    sequelize.query.mockResolvedValue([]);

    await reviewService.getReviewsByUser("user-1");
    await reviewService.getReviewsByProject("project-1");

    const sql = sequelize.query.mock.calls.map(([statement]) => statement).join("\n");
    expect(sql).not.toMatch(/reviewer_email/);
    expect(sql).not.toMatch(/reviewee_email/);
  });

  test("admin middleware rejects admin-role tokens that do not carry adminId", () => {
    const jwt = require("jsonwebtoken");
    const adminMiddleware = require("../src/middlewares/adminMiddleware");
    const token = jwt.sign(
      { email: "admin@example.com", role: "ADMIN" },
      process.env.JWT_SECRET,
      { issuer: "teamitaka-api", expiresIn: "1h" }
    );

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };
    const next = jest.fn();

    adminMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/관리자 권한/);
  });

  test("register rejects spoofed verification booleans without server evidence", async () => {
    const authController = require("../src/controllers/authController");

    const req = {
      body: {
        email: "user@example.com",
        password: "Abcd1234!",
        isSmsVerified: true,
        isEmailVerified: true,
      },
    };

    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
      cookie() {
        return this;
      },
    };

    await authController.register(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/서버에서 확인된 SMS 인증 또는 이메일 인증/);
  });
});
