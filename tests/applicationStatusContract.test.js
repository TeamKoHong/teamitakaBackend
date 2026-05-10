jest.mock("../src/services/applicationService", () => ({
  updateApplicationStatus: jest.fn(),
}));

const applicationService = require("../src/services/applicationService");
const { approveApplication } = require("../src/controllers/applicationController");

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

describe("Application status contract", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    applicationService.updateApplicationStatus.mockImplementation(async (applicationId, status) => ({
      application_id: applicationId,
      status,
    }));
  });

  test("approval endpoint persists and returns APPROVED, not legacy ACCEPTED", async () => {
    const req = {
      params: {
        application_id: "11111111-1111-4111-8111-111111111111",
      },
      user: {
        userId: "22222222-2222-4222-8222-222222222222",
      },
    };
    const res = createResponse();

    await approveApplication(req, res);

    expect(applicationService.updateApplicationStatus).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      "APPROVED",
      "22222222-2222-4222-8222-222222222222",
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.application.status).toBe("APPROVED");
  });

  test("duplicate approval returns APPROVED error code", async () => {
    applicationService.updateApplicationStatus.mockRejectedValueOnce(
      new Error("이미 승인된 지원입니다."),
    );

    const req = {
      params: {
        application_id: "11111111-1111-4111-8111-111111111111",
      },
      user: {
        userId: "22222222-2222-4222-8222-222222222222",
      },
    };
    const res = createResponse();

    await approveApplication(req, res);

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe("ALREADY_APPROVED");
  });

  test("non-owner approval returns forbidden", async () => {
    applicationService.updateApplicationStatus.mockRejectedValueOnce(
      new Error("모집글 작성자만 지원 상태를 변경할 수 있습니다."),
    );

    const req = {
      params: {
        application_id: "11111111-1111-4111-8111-111111111111",
      },
      user: {
        userId: "22222222-2222-4222-8222-222222222222",
      },
    };
    const res = createResponse();

    await approveApplication(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe("FORBIDDEN");
  });
});
