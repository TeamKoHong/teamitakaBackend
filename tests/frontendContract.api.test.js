const request = require("supertest");
const jwt = require("jsonwebtoken");

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
    authenticate: jest.fn().mockResolvedValue(),
    sync: jest.fn().mockResolvedValue(),
    query: jest.fn().mockResolvedValue([]),
    literal: jest.fn((value) => value),
    transaction: jest.fn().mockImplementation(() => Promise.resolve({
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
    })),
  },
  User: {
    findOne: jest.fn().mockResolvedValue(null),
    findByPk: jest.fn().mockResolvedValue(null),
    findAll: jest.fn().mockResolvedValue([]),
  },
  EmailVerification: {
    findOne: jest.fn().mockResolvedValue(null),
  },
  Todo: {
    findByPk: jest.fn().mockResolvedValue(null),
    findOne: jest.fn().mockResolvedValue(null),
    findAndCountAll: jest.fn().mockResolvedValue({ rows: [], count: 0 }),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  ProjectMembers: {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
  },
  Schedule: {
    findAll: jest.fn().mockResolvedValue([]),
    findAndCountAll: jest.fn().mockResolvedValue({ rows: [], count: 0 }),
    findByPk: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
  },
  Recruitment: {
    findAll: jest.fn().mockResolvedValue([]),
    findAndCountAll: jest.fn().mockResolvedValue({ rows: [], count: 0 }),
    findByPk: jest.fn().mockResolvedValue(null),
    increment: jest.fn().mockResolvedValue([1]),
  },
  Project: {
    findAll: jest.fn().mockResolvedValue([]),
    findByPk: jest.fn().mockResolvedValue(null),
  },
  MeetingNotes: {
    findAll: jest.fn().mockResolvedValue([]),
    findByPk: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
  },
  Scrap: {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
  },
  RecruitmentView: {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
  },
  Hashtag: {},
}));

jest.mock("src/services/smsService", () => ({
  normalizePhone: jest.fn((phone) => String(phone).replace(/[-\s]/g, "")),
  validatePhoneFormat: jest.fn().mockReturnValue(true),
  generateSessionId: jest.fn().mockReturnValue("11111111-1111-4111-8111-111111111111"),
  generateVerificationCode: jest.fn().mockReturnValue("123456"),
  saveVerification: jest.fn(),
  sendSms: jest.fn().mockResolvedValue({ messageId: "test-message-id" }),
  verifyCode: jest.fn().mockReturnValue({
    valid: false,
    phone: "01012345678",
    message: "인증번호가 일치하지 않습니다.",
  }),
  markPhoneVerified: jest.fn(),
  hasVerifiedPhone: jest.fn().mockReturnValue(false),
  consumeVerifiedPhone: jest.fn(),
}));

describe("Frontend contract API guards", () => {
  let app;
  const userId = "22222222-2222-4222-8222-222222222222";
  const projectId = "33333333-3333-4333-8333-333333333333";
  const authHeaderFor = (id = userId) => `Bearer ${jwt.sign(
    { userId: id, email: "contract@example.com", role: "user" },
    process.env.JWT_SECRET,
    { issuer: "teamitaka-api" },
  )}`;
  const authHeader = () => authHeaderFor(userId);

  beforeAll(() => {
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = "test-secret";
    process.env.CORS_ORIGIN = "http://localhost:3000";
    app = require("../src/app");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each([
    ["post", "/api/auth/refresh"],
    ["get", "/api/todos"],
    ["get", "/api/schedules/upcoming"],
    ["get", "/api/projects/11111111-1111-4111-8111-111111111111/notifications"],
  ])("%s %s is mounted and requires authentication", async (method, path) => {
    const response = await request(app)[method](path);

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toMatch(/인증|token/i);
  });

  test("SMS verification rejects the old 4-digit contract", async () => {
    const response = await request(app)
      .post("/api/auth/sms/verify")
      .send({
        sessionId: "11111111-1111-4111-8111-111111111111",
        code: "1234",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("VALIDATION_ERROR");
    expect(JSON.stringify(response.body)).toMatch(/6자리/);
  });

  test("SMS verification accepts 6-digit format before semantic verification", async () => {
    const response = await request(app)
      .post("/api/auth/sms/verify")
      .send({
        sessionId: "11111111-1111-4111-8111-111111111111",
        code: "123456",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("VERIFICATION_FAILED");
    expect(response.body.error).not.toBe("VALIDATION_ERROR");
  });

  test("GET /api/search rejects blank queries with a stable validation envelope", async () => {
    const response = await request(app).get("/api/search?q=   ");

    expect(response.statusCode).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: "INVALID_QUERY",
    });
  });

  test("GET /api/search returns the OpenAPI search envelope for recruitment results", async () => {
    const { Recruitment, Project, User } = require("src/models");
    Recruitment.findAll.mockResolvedValueOnce([
      {
        toJSON: () => ({
          recruitment_id: "recruitment-1",
          title: "React 서비스 개선 프로젝트",
          status: "ACTIVE",
          Hashtags: [{ name: "React" }],
        }),
      },
    ]);

    const response = await request(app).get("/api/search?q=React&type=recruitment");

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: "검색 결과입니다",
      data: {
        recruitments: [{
          recruitment_id: "recruitment-1",
          title: "React 서비스 개선 프로젝트",
          status: "ACTIVE",
        }],
        projects: [],
        users: [],
        total: 1,
      },
    });
    expect(Recruitment.findAll).toHaveBeenCalledTimes(1);
    expect(Project.findAll).not.toHaveBeenCalled();
    expect(User.findAll).not.toHaveBeenCalled();
  });

  test("GET /api/recruitments returns the OpenAPI list envelope for guest users", async () => {
    const { Recruitment, User } = require("src/models");
    Recruitment.findAndCountAll.mockResolvedValueOnce({
      rows: [{
        recruitment_id: "recruitment-1",
        User: { university: "홍익대학교" },
        toJSON: () => ({
          recruitment_id: "recruitment-1",
          title: "캠퍼스 브랜딩 팀원 모집",
          status: "ACTIVE",
          User: { university: "홍익대학교" },
        }),
      }],
      count: 1,
    });

    const response = await request(app).get("/api/recruitments?page=1&pageSize=10");

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: "모집글 목록을 조회했습니다",
      data: {
        items: [{
          recruitment_id: "recruitment-1",
          title: "캠퍼스 브랜딩 팀원 모집",
          university: "홍익대학교",
          is_scrapped: false,
        }],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 1,
        },
        filters: {
          university: null,
        },
      },
    });
    expect(User.findByPk).not.toHaveBeenCalled();
  });

  test("GET /api/recruitments applies authenticated university filtering in the backend query", async () => {
    const { Recruitment, Scrap, User } = require("src/models");
    User.findByPk.mockResolvedValueOnce({ university: "홍익대학교" });
    Scrap.findAll.mockResolvedValueOnce([{ recruitment_id: "recruitment-1" }]);
    Recruitment.findAndCountAll.mockResolvedValueOnce({
      rows: [{
        recruitment_id: "recruitment-1",
        User: { university: "홍익대학교" },
        toJSON: () => ({
          recruitment_id: "recruitment-1",
          title: "React 서비스 개선 프로젝트",
          status: "ACTIVE",
          User: { university: "홍익대학교" },
        }),
      }],
      count: 1,
    });

    const response = await request(app)
      .get("/api/recruitments?status=ACTIVE&project_type=side&page=2&pageSize=5")
      .set("Authorization", authHeader());

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      data: {
        items: [{
          recruitment_id: "recruitment-1",
          university: "홍익대학교",
          is_scrapped: true,
        }],
        pagination: {
          page: 2,
          pageSize: 5,
          total: 1,
        },
        filters: {
          university: "홍익대학교",
          status: "ACTIVE",
          project_type: "side",
        },
      },
    });
    expect(Recruitment.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: "ACTIVE", project_type: "side" },
      limit: 5,
      offset: 5,
      include: expect.arrayContaining([
        expect.objectContaining({
          model: User,
          required: true,
          where: { university: "홍익대학교" },
        }),
      ]),
    }));
  });

  test("GET /api/recruitments/:id is public and returns an OpenAPI detail envelope without guest view tracking", async () => {
    const { Recruitment, RecruitmentView, Scrap } = require("src/models");
    Recruitment.findByPk.mockResolvedValueOnce({
      toJSON: () => ({
        recruitment_id: "11111111-1111-4111-8111-111111111111",
        title: "공개 모집글",
        status: "ACTIVE",
        views: 10,
      }),
    });

    const response = await request(app).get("/api/recruitments/11111111-1111-4111-8111-111111111111");

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: "모집글을 조회했습니다",
      data: {
        recruitment_id: "11111111-1111-4111-8111-111111111111",
        title: "공개 모집글",
        is_scrapped: false,
      },
    });
    expect(RecruitmentView.findOne).not.toHaveBeenCalled();
    expect(Recruitment.increment).not.toHaveBeenCalled();
    expect(Scrap.findOne).not.toHaveBeenCalled();
  });

  test("GET /api/recruitments/:id adds authenticated view tracking and scrap state", async () => {
    const { Recruitment, RecruitmentView, Scrap } = require("src/models");
    Recruitment.findByPk.mockResolvedValueOnce({
      toJSON: () => ({
        recruitment_id: "11111111-1111-4111-8111-111111111111",
        title: "인증 모집글",
        status: "ACTIVE",
        views: 10,
      }),
    });
    RecruitmentView.findOne.mockResolvedValueOnce(null);
    Scrap.findOne.mockResolvedValueOnce({ scrap_id: "scrap-1" });

    const response = await request(app)
      .get("/api/recruitments/11111111-1111-4111-8111-111111111111")
      .set("Authorization", authHeader());

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      data: {
        recruitment_id: "11111111-1111-4111-8111-111111111111",
        title: "인증 모집글",
        is_scrapped: true,
      },
    });
    expect(RecruitmentView.findOne).toHaveBeenCalledWith({
      where: { user_id: userId, recruitment_id: "11111111-1111-4111-8111-111111111111" },
    });
    expect(RecruitmentView.create).toHaveBeenCalledWith({
      user_id: userId,
      recruitment_id: "11111111-1111-4111-8111-111111111111",
    });
    expect(Recruitment.increment).toHaveBeenCalledWith(
      { views: 1 },
      { where: { recruitment_id: "11111111-1111-4111-8111-111111111111" } },
    );
    expect(Scrap.findOne).toHaveBeenCalledWith({
      where: { user_id: userId, recruitment_id: "11111111-1111-4111-8111-111111111111" },
    });
  });

  test("GET /api/todos returns the dashboard collection envelope for authenticated users", async () => {
    const { Todo } = require("src/models");
    Todo.findAndCountAll.mockResolvedValueOnce({
      rows: [{ todo_id: "todo-1", title: "계약 테스트" }],
      count: 1,
    });

    const response = await request(app)
      .get("/api/todos?status=open&limit=10&offset=5")
      .set("Authorization", authHeader());

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: [{ todo_id: "todo-1", title: "계약 테스트" }],
      items: [{ todo_id: "todo-1", title: "계약 테스트" }],
      total: 1,
      limit: 10,
      offset: 5,
    });
    expect(Todo.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ user_id: userId }),
      limit: 10,
      offset: 5,
    }));
  });

  test("GET /api/schedules/upcoming returns dashboard envelope scoped to memberships", async () => {
    const { ProjectMembers, Schedule } = require("src/models");
    ProjectMembers.findAll.mockResolvedValueOnce([{ project_id: projectId }]);
    Schedule.findAndCountAll.mockResolvedValueOnce({
      rows: [{ schedule_id: "schedule-1", title: "주간 회의" }],
      count: 1,
    });

    const response = await request(app)
      .get("/api/schedules/upcoming?days=14&limit=4&offset=2")
      .set("Authorization", authHeader());

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: [{ schedule_id: "schedule-1", title: "주간 회의" }],
      items: [{ schedule_id: "schedule-1", title: "주간 회의" }],
      total: 1,
      limit: 4,
      offset: 2,
    });
    expect(ProjectMembers.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: { user_id: userId },
      attributes: ["project_id"],
    }));
    expect(Schedule.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        project_id: expect.any(Object),
        date: expect.any(Object),
      }),
      limit: 4,
      offset: 2,
    }));
  });

  test("GET /api/schedules/upcoming includes projects owned by the current user", async () => {
    const { Op } = require("sequelize");
    const { Project, ProjectMembers, Schedule } = require("src/models");
    ProjectMembers.findAll.mockResolvedValueOnce([]);
    Project.findAll.mockResolvedValueOnce([{ project_id: projectId }]);
    Schedule.findAndCountAll.mockResolvedValueOnce({
      rows: [{ schedule_id: "owner-schedule-1", title: "오너 일정" }],
      count: 1,
    });

    const response = await request(app)
      .get("/api/schedules/upcoming?days=7&limit=5&offset=0")
      .set("Authorization", authHeader());

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      items: [{ schedule_id: "owner-schedule-1", title: "오너 일정" }],
      total: 1,
    });
    expect(Project.findAll).toHaveBeenCalledWith({
      where: { user_id: userId },
      attributes: ["project_id"],
    });
    expect(Schedule.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        project_id: { [Op.in]: expect.arrayContaining([projectId]) },
      }),
    }));
  });

  test("GET /api/reviews/project/:project_id/summary returns envelope and legacy summary fields", async () => {
    const { sequelize } = require("src/models");
    sequelize.query
      .mockResolvedValueOnce([{ allowed: 1 }])
      .mockResolvedValueOnce([{
        total_reviews: "2",
        average_rating: "4.5",
        avg_ability: "4.5",
        avg_effort: "4.0",
        avg_commitment: "3.0",
        avg_communication: "4.2",
        avg_reflection: "3.8",
      }]);

    const response = await request(app)
      .get(`/api/reviews/project/${projectId}/summary`)
      .set("Authorization", authHeader());

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      averageRating: 4.5,
      totalReviews: 2,
      data: {
        averageRating: 4.5,
        totalReviews: 2,
        categoryAverages: {
          ability: 4.5,
          effort: 4,
          commitment: 3,
          communication: 4.2,
          reflection: 3.8,
        },
        summary: {
          strengths: expect.any(Array),
          improvements: expect.any(Array),
        },
      },
    });
  });

  test("GET /api/projects/:project_id rejects non-members", async () => {
    const { Project, ProjectMembers } = require("src/models");
    Project.findByPk.mockResolvedValueOnce({
      project_id: projectId,
      user_id: "owner-user",
      title: "비공개 프로젝트",
    });
    ProjectMembers.findOne.mockResolvedValueOnce(null);

    const response = await request(app)
      .get(`/api/projects/${projectId}`)
      .set("Authorization", authHeader());

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toMatch(/프로젝트 멤버/);
  });

  test("GET /api/projects/:project_id allows project members", async () => {
    const { Project, ProjectMembers } = require("src/models");
    Project.findByPk.mockResolvedValueOnce({
      project_id: projectId,
      user_id: "owner-user",
      title: "공유 프로젝트",
    });
    ProjectMembers.findOne.mockResolvedValueOnce({ project_id: projectId, user_id: userId, role: "팀원" });

    const response = await request(app)
      .get(`/api/projects/${projectId}`)
      .set("Authorization", authHeader());

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      project_id: projectId,
      title: "공유 프로젝트",
    });
  });

  test("PUT /api/projects/:project_id rejects project members who are not leaders", async () => {
    const { Project, ProjectMembers } = require("src/models");
    const update = jest.fn();
    Project.findByPk.mockResolvedValueOnce({
      project_id: projectId,
      user_id: "owner-user",
      title: "공유 프로젝트",
      update,
    });
    ProjectMembers.findOne.mockResolvedValueOnce({ project_id: projectId, user_id: userId, role: "팀원" });

    const response = await request(app)
      .put(`/api/projects/${projectId}`)
      .set("Authorization", authHeader())
      .send({ title: "변경 시도" });

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toMatch(/팀장/);
    expect(update).not.toHaveBeenCalled();
  });

  test("GET /api/projects/:project_id/members rejects non-members before exposing member list", async () => {
    const { Project, ProjectMembers, sequelize } = require("src/models");
    Project.findByPk.mockResolvedValueOnce({ project_id: projectId, user_id: "owner-user" });
    ProjectMembers.findOne.mockResolvedValueOnce(null);

    const response = await request(app)
      .get(`/api/projects/${projectId}/members`)
      .set("Authorization", authHeader());

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toMatch(/프로젝트 멤버/);
    expect(sequelize.query).not.toHaveBeenCalled();
  });

  test("PUT /api/projects/:project_id/members rejects non-leaders", async () => {
    const { Project, ProjectMembers, sequelize } = require("src/models");
    Project.findByPk.mockResolvedValueOnce({ project_id: projectId, user_id: "owner-user" });
    ProjectMembers.findOne.mockResolvedValueOnce({ project_id: projectId, user_id: userId, role: "팀원" });

    const response = await request(app)
      .put(`/api/projects/${projectId}/members`)
      .set("Authorization", authHeader())
      .send({ user_id: "77777777-7777-4777-8777-777777777777", role: "팀원" });

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toMatch(/팀장/);
    expect(sequelize.transaction).not.toHaveBeenCalled();
  });

  test("POST /api/projects/:project_id/meetings rejects non-members", async () => {
    const { Project, ProjectMembers, MeetingNotes } = require("src/models");
    Project.findByPk.mockResolvedValueOnce({ project_id: projectId, user_id: "owner-user" });
    ProjectMembers.findOne.mockResolvedValueOnce(null);

    const response = await request(app)
      .post(`/api/projects/${projectId}/meetings`)
      .set("Authorization", authHeader())
      .send({
        title: "주간 회의",
        content: "회의 내용",
        meeting_date: "2026-05-10T09:00:00.000Z",
      });

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toMatch(/프로젝트 멤버/);
    expect(MeetingNotes.create).not.toHaveBeenCalled();
  });

  test("POST /api/projects/:project_id/meetings allows project members to create notes", async () => {
    const { MeetingNotes, Project, ProjectMembers } = require("src/models");
    Project.findByPk.mockResolvedValueOnce({ project_id: projectId, user_id: "owner-user" });
    ProjectMembers.findOne.mockResolvedValueOnce({ project_id: projectId, user_id: userId, role: "팀원" });
    MeetingNotes.create.mockResolvedValueOnce({
      meeting_id: "44444444-4444-4444-8444-444444444444",
      project_id: projectId,
      created_by: userId,
      title: "주간 회의",
    });

    const response = await request(app)
      .post(`/api/projects/${projectId}/meetings`)
      .set("Authorization", authHeader())
      .send({
        title: "주간 회의",
        content: "회의 내용",
        meeting_date: "2026-05-10T09:00:00.000Z",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        project_id: projectId,
        created_by: userId,
        title: "주간 회의",
      },
    });
    expect(MeetingNotes.create).toHaveBeenCalledWith(expect.objectContaining({
      project_id: projectId,
      created_by: userId,
      title: "주간 회의",
    }));
  });

  test("PUT /api/projects/:project_id/meetings/:meeting_id rejects members who are not author or owner", async () => {
    const { MeetingNotes, Project, ProjectMembers } = require("src/models");
    const update = jest.fn();
    Project.findByPk.mockResolvedValueOnce({ project_id: projectId, user_id: "owner-user" });
    ProjectMembers.findOne.mockResolvedValueOnce({ project_id: projectId, user_id: userId, role: "팀원" });
    MeetingNotes.findByPk.mockResolvedValueOnce({
      meeting_id: "44444444-4444-4444-8444-444444444444",
      project_id: projectId,
      created_by: "another-user",
      update,
    });

    const response = await request(app)
      .put(`/api/projects/${projectId}/meetings/44444444-4444-4444-8444-444444444444`)
      .set("Authorization", authHeader())
      .send({ title: "수정된 회의" });

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toMatch(/작성자 또는 프로젝트 팀장/);
    expect(update).not.toHaveBeenCalled();
  });

  test("DELETE /api/projects/:project_id/meetings/:meeting_id allows project owners", async () => {
    const { MeetingNotes, Project } = require("src/models");
    const destroy = jest.fn().mockResolvedValue();
    Project.findByPk.mockResolvedValueOnce({ project_id: projectId, user_id: userId });
    MeetingNotes.findByPk.mockResolvedValueOnce({
      meeting_id: "44444444-4444-4444-8444-444444444444",
      project_id: projectId,
      created_by: "another-user",
      destroy,
    });

    const response = await request(app)
      .delete(`/api/projects/${projectId}/meetings/44444444-4444-4444-8444-444444444444`)
      .set("Authorization", authHeader());

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: "회의록이 삭제되었습니다",
    });
    expect(destroy).toHaveBeenCalled();
  });

  test("Completing a project todo records completed metadata and exposes it in activity log", async () => {
    const { Project, ProjectMembers, Todo } = require("src/models");
    const update = jest.fn().mockResolvedValue();
    Project.findByPk
      .mockResolvedValueOnce({ project_id: projectId, user_id: "owner-user" })
      .mockResolvedValueOnce({ project_id: projectId, user_id: "owner-user" });
    ProjectMembers.findOne
      .mockResolvedValueOnce({ project_id: projectId, user_id: userId, role: "팀원" })
      .mockResolvedValueOnce({ project_id: projectId, user_id: userId, role: "팀원" });
    Todo.findOne.mockResolvedValueOnce({
      todo_id: "55555555-5555-4555-8555-555555555555",
      project_id: projectId,
      user_id: userId,
      title: "API 계약 고정",
      status: "PENDING",
      update,
    });
    Todo.findAndCountAll.mockResolvedValueOnce({
      rows: [{
        todo_id: "55555555-5555-4555-8555-555555555555",
        project_id: projectId,
        title: "API 계약 고정",
        status: "COMPLETED",
        completed_by: userId,
      }],
      count: 1,
    });

    const updateResponse = await request(app)
      .put(`/api/projects/${projectId}/todo/55555555-5555-4555-8555-555555555555`)
      .set("Authorization", authHeader())
      .send({ status: "COMPLETED" });

    expect(updateResponse.statusCode).toBe(200);
    expect(Todo.findOne).toHaveBeenCalledWith({
      where: {
        todo_id: "55555555-5555-4555-8555-555555555555",
        project_id: projectId,
      },
    });
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      status: "COMPLETED",
      completed_by: userId,
      completed_at: expect.any(Date),
    }));

    const logResponse = await request(app)
      .get(`/api/projects/${projectId}/activity-log?limit=5&offset=0`)
      .set("Authorization", authHeader());

    expect(logResponse.statusCode).toBe(200);
    expect(logResponse.body).toMatchObject({
      activity_logs: [{
        todo_id: "55555555-5555-4555-8555-555555555555",
        title: "API 계약 고정",
        status: "COMPLETED",
        completed_by: userId,
      }],
      total: 1,
      limit: 5,
      offset: 0,
    });
  });

  test("PUT /api/projects/:project_id/todo/:todo_id rejects non-assigned members", async () => {
    const { Project, ProjectMembers, Todo } = require("src/models");
    const update = jest.fn();
    Project.findByPk.mockResolvedValueOnce({ project_id: projectId, user_id: "owner-user" });
    ProjectMembers.findOne.mockResolvedValueOnce({ project_id: projectId, user_id: userId, role: "팀원" });
    Todo.findOne.mockResolvedValueOnce({
      todo_id: "55555555-5555-4555-8555-555555555555",
      project_id: projectId,
      user_id: "another-user",
      title: "다른 팀원의 Todo",
      status: "PENDING",
      update,
    });

    const response = await request(app)
      .put(`/api/projects/${projectId}/todo/55555555-5555-4555-8555-555555555555`)
      .set("Authorization", authHeader())
      .send({ status: "COMPLETED" });

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toMatch(/본인에게 할당된 Todo/);
    expect(update).not.toHaveBeenCalled();
  });

  test("DELETE /api/projects/:project_id/todo/:todo_id scopes deletion to project and assignee", async () => {
    const { Project, ProjectMembers, Todo } = require("src/models");
    const destroy = jest.fn().mockResolvedValue();
    Project.findByPk.mockResolvedValueOnce({ project_id: projectId, user_id: "owner-user" });
    ProjectMembers.findOne.mockResolvedValueOnce({ project_id: projectId, user_id: userId, role: "팀원" });
    Todo.findOne.mockResolvedValueOnce({
      todo_id: "55555555-5555-4555-8555-555555555555",
      project_id: projectId,
      user_id: userId,
      destroy,
    });

    const response = await request(app)
      .delete(`/api/projects/${projectId}/todo/55555555-5555-4555-8555-555555555555`)
      .set("Authorization", authHeader());

    expect(response.statusCode).toBe(200);
    expect(Todo.findOne).toHaveBeenCalledWith({
      where: {
        todo_id: "55555555-5555-4555-8555-555555555555",
        project_id: projectId,
      },
    });
    expect(destroy).toHaveBeenCalled();
  });

  test("POST /api/schedule/create rejects non-members", async () => {
    const { Project, ProjectMembers, Schedule } = require("src/models");
    Project.findByPk.mockResolvedValueOnce({ project_id: projectId, user_id: "owner-user" });
    ProjectMembers.findOne.mockResolvedValueOnce(null);

    const response = await request(app)
      .post("/api/schedule/create")
      .set("Authorization", authHeader())
      .send({
        project_id: projectId,
        title: "마일스톤 점검",
        description: "진행 상황 공유",
        date: "2026-05-10T00:00:00.000Z",
      });

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toMatch(/프로젝트 멤버/);
    expect(Schedule.create).not.toHaveBeenCalled();
  });

  test("POST /api/schedule/create allows project members and returns the created schedule", async () => {
    const { Project, ProjectMembers, Schedule } = require("src/models");
    Project.findByPk.mockResolvedValueOnce({ project_id: projectId, user_id: "owner-user" });
    ProjectMembers.findOne.mockResolvedValueOnce({ project_id: projectId, user_id: userId, role: "팀원" });
    Schedule.create.mockResolvedValueOnce({
      schedule_id: "66666666-6666-4666-8666-666666666666",
      project_id: projectId,
      title: "마일스톤 점검",
      description: "진행 상황 공유",
      date: "2026-05-10T00:00:00.000Z",
      created_by: userId,
    });

    const response = await request(app)
      .post("/api/schedule/create")
      .set("Authorization", authHeader())
      .send({
        project_id: projectId,
        title: "마일스톤 점검",
        description: "진행 상황 공유",
        date: "2026-05-10T00:00:00.000Z",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      schedule_id: "66666666-6666-4666-8666-666666666666",
      project_id: projectId,
      title: "마일스톤 점검",
      created_by: userId,
    });
    expect(Schedule.create).toHaveBeenCalledWith({
      project_id: projectId,
      title: "마일스톤 점검",
      description: "진행 상황 공유",
      date: "2026-05-10T00:00:00.000Z",
      created_by: userId,
    });
  });

  test("PUT /api/schedule/:schedule_id rejects non-members", async () => {
    const { Project, ProjectMembers, Schedule } = require("src/models");
    const update = jest.fn();
    Schedule.findByPk.mockResolvedValueOnce({
      schedule_id: "66666666-6666-4666-8666-666666666666",
      project_id: projectId,
      title: "마일스톤 점검",
      update,
    });
    Project.findByPk.mockResolvedValueOnce({ project_id: projectId, user_id: "owner-user" });
    ProjectMembers.findOne.mockResolvedValueOnce(null);

    const response = await request(app)
      .put("/api/schedule/66666666-6666-4666-8666-666666666666")
      .set("Authorization", authHeader())
      .send({ title: "변경된 일정" });

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toMatch(/프로젝트 멤버/);
    expect(update).not.toHaveBeenCalled();
  });

  test("PUT /api/schedule/:schedule_id allows project members to update schedules", async () => {
    const { Project, ProjectMembers, Schedule } = require("src/models");
    const update = jest.fn().mockResolvedValue();
    Schedule.findByPk.mockResolvedValueOnce({
      schedule_id: "66666666-6666-4666-8666-666666666666",
      project_id: projectId,
      title: "마일스톤 점검",
      update,
    });
    Project.findByPk.mockResolvedValueOnce({ project_id: projectId, user_id: "owner-user" });
    ProjectMembers.findOne.mockResolvedValueOnce({ project_id: projectId, user_id: userId, role: "팀원" });

    const response = await request(app)
      .put("/api/schedule/66666666-6666-4666-8666-666666666666")
      .set("Authorization", authHeader())
      .send({
        title: "변경된 일정",
        date: "2026-05-11T00:00:00.000Z",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: "일정이 수정되었습니다.",
    });
    expect(update).toHaveBeenCalledWith({
      title: "변경된 일정",
      date: "2026-05-11T00:00:00.000Z",
    });
  });

  test("DELETE /api/schedule/:schedule_id allows project owners to delete schedules", async () => {
    const { Project, Schedule } = require("src/models");
    const destroy = jest.fn().mockResolvedValue();
    Schedule.findByPk.mockResolvedValueOnce({
      schedule_id: "66666666-6666-4666-8666-666666666666",
      project_id: projectId,
      title: "마일스톤 점검",
      destroy,
    });
    Project.findByPk.mockResolvedValueOnce({ project_id: projectId, user_id: userId });

    const response = await request(app)
      .delete("/api/schedule/66666666-6666-4666-8666-666666666666")
      .set("Authorization", authHeader());

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: "일정이 삭제되었습니다.",
    });
    expect(destroy).toHaveBeenCalled();
  });
});
