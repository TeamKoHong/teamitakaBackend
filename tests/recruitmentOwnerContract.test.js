describe("Recruitment owner contract", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  const createRecruitmentRecord = (overrides = {}) => ({
    recruitment_id: "11111111-1111-4111-8111-111111111111",
    user_id: "owner-user",
    title: "기존 모집글",
    description: "기존 설명",
    status: "ACTIVE",
    update: jest.fn().mockResolvedValue(),
    setHashtags: jest.fn().mockResolvedValue(),
    destroy: jest.fn().mockResolvedValue(),
    ...overrides,
  });

  const mockModels = (recruitment) => {
    jest.doMock("../src/models", () => ({
      Recruitment: {
        findByPk: jest.fn().mockResolvedValue(recruitment),
      },
      Project: {
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ project_id: "project-1" }),
      },
      Hashtag: {
        findOrCreate: jest.fn().mockImplementation(async ({ where }) => [{ name: where.name }, false]),
      },
      Application: {
        findAll: jest.fn().mockResolvedValue([]),
      },
      Scrap: {
        findAll: jest.fn().mockResolvedValue([]),
      },
      User: {},
      sequelize: {
        literal: jest.fn((value) => value),
      },
    }));
  };

  const createResponse = () => ({
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
  });

  test("updateRecruitment rejects non-owner writes before updating data", async () => {
    const recruitment = createRecruitmentRecord();
    mockModels(recruitment);

    const recruitmentService = require("../src/services/recruitmentService");

    await expect(
      recruitmentService.updateRecruitment(
        recruitment.recruitment_id,
        "another-user",
        { title: "탈취 시도" }
      )
    ).rejects.toMatchObject({
      status: 403,
      message: "본인의 모집글만 수정하거나 삭제할 수 있습니다.",
    });
    expect(recruitment.update).not.toHaveBeenCalled();
  });

  test("deleteRecruitment rejects non-owner deletes before destroying data", async () => {
    const recruitment = createRecruitmentRecord();
    mockModels(recruitment);

    const recruitmentService = require("../src/services/recruitmentService");

    await expect(
      recruitmentService.deleteRecruitment(recruitment.recruitment_id, "another-user")
    ).rejects.toMatchObject({
      status: 403,
      message: "본인의 모집글만 수정하거나 삭제할 수 있습니다.",
    });
    expect(recruitment.setHashtags).not.toHaveBeenCalled();
    expect(recruitment.destroy).not.toHaveBeenCalled();
  });

  test("updateRecruitment preserves allowed update fields for the owner", async () => {
    const recruitment = createRecruitmentRecord();
    mockModels(recruitment);

    const recruitmentService = require("../src/services/recruitmentService");

    await recruitmentService.updateRecruitment(recruitment.recruitment_id, "owner-user", {
      title: "수정된 모집글",
      description: "수정된 설명",
      max_applicants: 5,
      project_type: "side",
      recruitment_start: "2026-05-10",
      recruitment_end: "2026-05-20",
      photo_url: "https://example.test/recruitment.png",
    });

    expect(recruitment.update).toHaveBeenCalledWith({
      title: "수정된 모집글",
      description: "수정된 설명",
      max_applicants: 5,
      project_type: "side",
      recruitment_start: "2026-05-10",
      recruitment_end: "2026-05-20",
      photo_url: "https://example.test/recruitment.png",
    });
  });

  test("getApplicants rejects non-owner access before exposing applicant data", async () => {
    const recruitment = createRecruitmentRecord();
    mockModels(recruitment);

    const { Application } = require("../src/models");
    const applicationService = require("../src/services/applicationService");

    await expect(
      applicationService.getApplicants(recruitment.recruitment_id, "another-user")
    ).rejects.toMatchObject({
      status: 403,
      message: "모집글 작성자만 지원자 목록을 조회할 수 있습니다.",
    });
    expect(Application.findAll).not.toHaveBeenCalled();
  });

  test("createProjectFromRecruitment rejects non-owner kickoff before project creation", async () => {
    const recruitment = createRecruitmentRecord();
    const transaction = {
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
    };
    const Project = {
      findByPk: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    };

    jest.doMock("../src/models", () => ({
      Project,
      Recruitment: {
        findByPk: jest.fn().mockResolvedValue(recruitment),
      },
      User: {},
      Todo: {},
      Timeline: {},
      ProjectMembers: {
        create: jest.fn(),
        findOne: jest.fn(),
      },
      Application: {},
      sequelize: {
        transaction: jest.fn().mockResolvedValue(transaction),
        query: jest.fn(),
      },
    }));
    jest.doMock("../src/services/projectService", () => ({
      updateProject: jest.fn(),
    }));

    const { createProjectFromRecruitment } = require("../src/controllers/projectController");
    const req = {
      params: { recruitment_id: recruitment.recruitment_id },
      body: {
        title: "프로젝트 시작",
        memberUserIds: ["applicant-user"],
      },
      user: { userId: "another-user" },
    };
    const res = createResponse();

    await createProjectFromRecruitment(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body).toMatchObject({
      success: false,
      error: "FORBIDDEN",
      message: "모집글 작성자만 프로젝트를 시작할 수 있습니다.",
    });
    expect(Project.create).not.toHaveBeenCalled();
    expect(transaction.rollback).toHaveBeenCalled();
  });

  test("createProjectFromRecruitment only adds approved applicants as project members", async () => {
    const recruitment = createRecruitmentRecord();
    const transaction = {
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
    };
    const Project = {
      findByPk: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn().mockResolvedValue({
        project_id: "project-1",
        title: "프로젝트 시작",
        resolution: null,
        project_type: "side",
        user_id: "owner-user",
        start_date: null,
        end_date: null,
        status: "ACTIVE",
        createdAt: new Date("2026-05-12T00:00:00.000Z"),
      }),
    };
    const Application = {
      findAll: jest.fn().mockResolvedValue([
        { user_id: "approved-user" },
        { user_id: "second-approved-user" },
      ]),
    };
    const ProjectMembers = {
      create: jest.fn().mockImplementation(async (payload) => payload),
      findOne: jest.fn(),
    };

    jest.doMock("../src/models", () => ({
      Project,
      Recruitment: {
        findByPk: jest.fn().mockResolvedValue(recruitment),
      },
      User: {},
      Todo: {},
      Timeline: {},
      ProjectMembers,
      Application,
      sequelize: {
        transaction: jest.fn().mockResolvedValue(transaction),
        query: jest.fn(),
      },
    }));
    jest.doMock("../src/services/projectService", () => ({
      updateProject: jest.fn(),
    }));

    const { createProjectFromRecruitment } = require("../src/controllers/projectController");
    const req = {
      params: { recruitment_id: recruitment.recruitment_id },
      body: {
        title: "프로젝트 시작",
        memberUserIds: ["owner-user", "approved-user", "approved-user", "second-approved-user"],
      },
      user: { userId: "owner-user" },
    };
    const res = createResponse();

    await createProjectFromRecruitment(req, res);

    expect(res.statusCode).toBe(201);
    expect(Application.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        recruitment_id: recruitment.recruitment_id,
        user_id: ["approved-user", "second-approved-user"],
        status: "APPROVED",
      }),
      attributes: ["user_id"],
      transaction,
    }));
    expect(ProjectMembers.create).toHaveBeenCalledTimes(3);
    expect(ProjectMembers.create).toHaveBeenNthCalledWith(1, expect.objectContaining({
      user_id: "owner-user",
      role: "LEADER",
    }), { transaction });
    expect(ProjectMembers.create).toHaveBeenNthCalledWith(2, expect.objectContaining({
      user_id: "approved-user",
      role: "MEMBER",
    }), { transaction });
    expect(ProjectMembers.create).toHaveBeenNthCalledWith(3, expect.objectContaining({
      user_id: "second-approved-user",
      role: "MEMBER",
    }), { transaction });
    expect(transaction.commit).toHaveBeenCalled();
  });

  test("createProjectFromRecruitment rejects unapproved member ids before project creation", async () => {
    const recruitment = createRecruitmentRecord();
    const transaction = {
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
    };
    const Project = {
      findByPk: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    };
    const Application = {
      findAll: jest.fn().mockResolvedValue([{ user_id: "approved-user" }]),
    };

    jest.doMock("../src/models", () => ({
      Project,
      Recruitment: {
        findByPk: jest.fn().mockResolvedValue(recruitment),
      },
      User: {},
      Todo: {},
      Timeline: {},
      ProjectMembers: {
        create: jest.fn(),
        findOne: jest.fn(),
      },
      Application,
      sequelize: {
        transaction: jest.fn().mockResolvedValue(transaction),
        query: jest.fn(),
      },
    }));
    jest.doMock("../src/services/projectService", () => ({
      updateProject: jest.fn(),
    }));

    const { createProjectFromRecruitment } = require("../src/controllers/projectController");
    const req = {
      params: { recruitment_id: recruitment.recruitment_id },
      body: {
        title: "프로젝트 시작",
        memberUserIds: ["approved-user", "pending-user"],
      },
      user: { userId: "owner-user" },
    };
    const res = createResponse();

    await createProjectFromRecruitment(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      error: "INVALID_PROJECT_MEMBERS",
      message: "승인된 지원자만 프로젝트 멤버로 추가할 수 있습니다.",
      invalidMemberUserIds: ["pending-user"],
    });
    expect(Project.create).not.toHaveBeenCalled();
    expect(transaction.rollback).toHaveBeenCalled();
    expect(transaction.commit).not.toHaveBeenCalled();
  });
});
