describe("Application status contract", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test("approveApplication writes APPROVED status", async () => {
    const updateApplicationStatus = jest.fn().mockResolvedValue({
      application_id: "11111111-1111-4111-8111-111111111111",
      status: "APPROVED",
    });

    jest.doMock("../src/services/applicationService", () => ({
      updateApplicationStatus,
    }));
    jest.doMock("../src/utils/errorHandler", () => ({
      handleError: jest.fn(),
    }));

    const { approveApplication } = require("../src/controllers/applicationController");
    const req = {
      params: {
        application_id: "11111111-1111-4111-8111-111111111111",
      },
      user: {
        userId: "22222222-2222-4222-8222-222222222222",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await approveApplication(req, res);

    expect(updateApplicationStatus).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      "APPROVED",
      "22222222-2222-4222-8222-222222222222"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        application: expect.objectContaining({ status: "APPROVED" }),
      })
    );
  });

  test("duplicate approval returns the APPROVED error contract", async () => {
    jest.doMock("../src/services/applicationService", () => ({
      updateApplicationStatus: jest.fn().mockRejectedValue(new Error("이미 승인된 지원입니다.")),
    }));
    jest.doMock("../src/utils/errorHandler", () => ({
      handleError: jest.fn(),
    }));

    const { approveApplication } = require("../src/controllers/applicationController");
    const req = {
      params: {
        application_id: "11111111-1111-4111-8111-111111111111",
      },
      user: {
        userId: "22222222-2222-4222-8222-222222222222",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await approveApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: "ALREADY_APPROVED",
      })
    );
  });

  test("rejectApplication writes REJECTED status", async () => {
    const updateApplicationStatus = jest.fn().mockResolvedValue({
      application_id: "11111111-1111-4111-8111-111111111111",
      status: "REJECTED",
    });

    jest.doMock("../src/services/applicationService", () => ({
      updateApplicationStatus,
    }));
    jest.doMock("../src/utils/errorHandler", () => ({
      handleError: jest.fn(),
    }));

    const { rejectApplication } = require("../src/controllers/applicationController");
    const req = {
      params: {
        application_id: "11111111-1111-4111-8111-111111111111",
      },
      user: {
        userId: "22222222-2222-4222-8222-222222222222",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await rejectApplication(req, res);

    expect(updateApplicationStatus).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      "REJECTED",
      "22222222-2222-4222-8222-222222222222"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        updatedApplication: expect.objectContaining({ status: "REJECTED" }),
      })
    );
  });

  test("application service treats APPROVED as the accepted-team state", async () => {
    jest.dontMock("../src/services/applicationService");
    jest.dontMock("../src/utils/errorHandler");

    const save = jest.fn().mockResolvedValue();
    const application = {
      application_id: "11111111-1111-4111-8111-111111111111",
      recruitment_id: "22222222-2222-4222-8222-222222222222",
      user_id: "33333333-3333-4333-8333-333333333333",
      status: "PENDING",
      save,
    };
    const recruitment = {
      status: "ACTIVE",
      max_applicants: 3,
      project_id: "44444444-4444-4444-8444-444444444444",
      user_id: "55555555-5555-4555-8555-555555555555",
      title: "팀미타카",
      Project: { title: "팀미타카 프로젝트" },
      update: jest.fn(),
    };
    const sendToUser = jest.fn().mockResolvedValue();

    jest.doMock("../src/models", () => ({
      Application: {
        findByPk: jest.fn().mockResolvedValue(application),
        count: jest.fn().mockResolvedValue(1),
      },
      Recruitment: {
        findByPk: jest.fn().mockResolvedValue(recruitment),
      },
      Project: {},
      ApplicationPortfolio: {},
      User: {},
      sequelize: {},
    }));
    jest.doMock("../src/services/pushService", () => ({
      PUSH_TYPES: {
        TEAM_MATCH_ACCEPTED: "team_match_accepted",
      },
      sendToUser,
    }));

    const { updateApplicationStatus } = require("../src/services/applicationService");

    const result = await updateApplicationStatus(application.application_id, "APPROVED");

    expect(result.status).toBe("APPROVED");
    expect(save).toHaveBeenCalled();
    expect(sendToUser).toHaveBeenCalledWith(
      application.user_id,
      "team_match_accepted",
      expect.objectContaining({
        projectName: "팀미타카 프로젝트",
        projectId: recruitment.project_id,
      })
    );
  });

  test("application service blocks approval from non-owners", async () => {
    jest.dontMock("../src/services/applicationService");
    jest.dontMock("../src/utils/errorHandler");

    const application = {
      application_id: "11111111-1111-4111-8111-111111111111",
      recruitment_id: "22222222-2222-4222-8222-222222222222",
      user_id: "33333333-3333-4333-8333-333333333333",
      status: "PENDING",
      save: jest.fn(),
    };
    const recruitment = {
      user_id: "55555555-5555-4555-8555-555555555555",
      Project: { title: "팀미타카 프로젝트" },
    };

    jest.doMock("../src/models", () => ({
      Application: {
        findByPk: jest.fn().mockResolvedValue(application),
        count: jest.fn(),
      },
      Recruitment: {
        findByPk: jest.fn().mockResolvedValue(recruitment),
      },
      Project: {},
      ApplicationPortfolio: {},
      User: {},
      sequelize: {},
    }));
    jest.doMock("../src/services/pushService", () => ({
      PUSH_TYPES: {
        TEAM_MATCH_ACCEPTED: "team_match_accepted",
      },
      sendToUser: jest.fn(),
    }));

    const { updateApplicationStatus } = require("../src/services/applicationService");

    await expect(
      updateApplicationStatus(
        application.application_id,
        "APPROVED",
        "66666666-6666-4666-8666-666666666666"
      )
    ).rejects.toThrow("모집글 작성자만 지원 상태를 변경할 수 있습니다.");
    expect(application.save).not.toHaveBeenCalled();
  });
});
