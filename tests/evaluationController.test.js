jest.mock("../src/services/reviewService", () => ({
  getReviewsByReviewer: jest.fn(),
}));

jest.mock("../src/models", () => ({
  sequelize: {
    query: jest.fn(),
  },
}));

const reviewService = require("../src/services/reviewService");
const evaluationController = require("../src/controllers/evaluationController");

const createRes = () => {
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
  return res;
};

describe("evaluationController.getGivenEvaluations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("passes authenticated actor id into reviewService permission checks", async () => {
    reviewService.getReviewsByReviewer.mockResolvedValue([]);
    const req = {
      user: { userId: "user-1" },
      query: { projectId: "project-1" },
    };
    const res = createRes();

    await evaluationController.getGivenEvaluations(req, res);

    expect(reviewService.getReviewsByReviewer).toHaveBeenCalledWith(
      "project-1",
      "user-1",
      "user-1"
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        given_evaluations: [],
        total: 0,
      },
    });
  });

  test("preserves service error status for forbidden lookup failures", async () => {
    const forbidden = new Error("프로젝트 멤버만 리뷰를 조회할 수 있습니다.");
    forbidden.status = 403;
    reviewService.getReviewsByReviewer.mockRejectedValue(forbidden);
    const req = {
      user: { userId: "user-1" },
      query: { projectId: "project-1" },
    };
    const res = createRes();

    await evaluationController.getGivenEvaluations(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body).toMatchObject({
      success: false,
      error: "프로젝트 멤버만 리뷰를 조회할 수 있습니다.",
    });
  });
});
