describe("Review contract", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  const validBody = {
    project_id: "11111111-1111-4111-8111-111111111111",
    reviewer_id: "spoofed-reviewer",
    reviewee_id: "22222222-2222-4222-8222-222222222222",
    role_description: "프론트엔드",
    ability: 5,
    effort: 5,
    commitment: 5,
    communication: 5,
    reflection: 5,
    overall_rating: 5,
    comment: "함께 일하기 좋았습니다.",
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

  const participantRows = [{ allowed: 1 }];

  test("createReview uses authenticated user as reviewer, not body reviewer_id", async () => {
    const createReview = jest.fn().mockImplementation(async (payload) => payload);
    jest.doMock("../src/services/reviewService", () => ({
      createReview,
    }));

    const { createReview: createReviewController } = require("../src/controllers/reviewController");
    const req = {
      body: validBody,
      user: {
        userId: "33333333-3333-4333-8333-333333333333",
      },
    };
    const res = createResponse();

    await createReviewController(req, res);

    expect(createReview).toHaveBeenCalledWith(
      expect.objectContaining({
        project_id: validBody.project_id,
        reviewer_id: "33333333-3333-4333-8333-333333333333",
        reviewee_id: validBody.reviewee_id,
      })
    );
    expect(res.statusCode).toBe(201);
    expect(res.body.reviewer_id).toBe("33333333-3333-4333-8333-333333333333");
  });

  test("duplicate review is a deterministic conflict", async () => {
    const duplicateError = new Error("이미 평가를 제출했습니다.");
    duplicateError.code = "DUPLICATE_REVIEW";
    jest.doMock("../src/services/reviewService", () => ({
      createReview: jest.fn().mockRejectedValue(duplicateError),
    }));

    const { createReview: createReviewController } = require("../src/controllers/reviewController");
    const req = {
      body: validBody,
      user: {
        userId: "33333333-3333-4333-8333-333333333333",
      },
    };
    const res = createResponse();

    await createReviewController(req, res);

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe("이미 평가를 제출했습니다.");
  });

  test("service rejects non-project reviewer before duplicate lookup or insert", async () => {
    jest.dontMock("../src/services/reviewService");
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    const query = jest.fn().mockResolvedValueOnce([]);

    jest.doMock("../src/models", () => ({
      sequelize: { query },
    }));

    const ReviewService = require("../src/services/reviewService");

    await expect(ReviewService.createReview({
      project_id: validBody.project_id,
      reviewer_id: "33333333-3333-4333-8333-333333333333",
      reviewee_id: validBody.reviewee_id,
      role_description: validBody.role_description,
      ability: 5,
      effort: 5,
      commitment: 5,
      communication: 5,
      reflection: 5,
      overall_rating: 5,
      comment: validBody.comment,
    })).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN",
      message: "프로젝트 멤버만 평가할 수 있습니다.",
    });
    expect(query).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });

  test("service rejects duplicate project reviewer reviewee tuple before insert", async () => {
    jest.dontMock("../src/services/reviewService");
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    const query = jest.fn()
      .mockResolvedValueOnce(participantRows)
      .mockResolvedValueOnce(participantRows)
      .mockResolvedValueOnce([
        { review_id: "44444444-4444-4444-8444-444444444444" },
      ]);

    jest.doMock("../src/models", () => ({
      sequelize: { query },
    }));

    const ReviewService = require("../src/services/reviewService");

    await expect(
      ReviewService.createReview({
        project_id: validBody.project_id,
        reviewer_id: "33333333-3333-4333-8333-333333333333",
        reviewee_id: validBody.reviewee_id,
        role_description: validBody.role_description,
        ability: 5,
        effort: 5,
        commitment: 5,
        communication: 5,
        reflection: 5,
        overall_rating: 5,
        comment: validBody.comment,
      })
    ).rejects.toMatchObject({
      code: "DUPLICATE_REVIEW",
      message: "이미 평가를 제출했습니다.",
    });
    expect(query).toHaveBeenCalledTimes(3);
    consoleError.mockRestore();
  });

  test("reviewer lookup exposes role description and reviewee task for frontend status pages", async () => {
    jest.dontMock("../src/services/reviewService");

    const query = jest.fn()
      .mockResolvedValueOnce(participantRows)
      .mockResolvedValueOnce([]);
    jest.doMock("../src/models", () => ({
      sequelize: { query },
    }));

    const ReviewService = require("../src/services/reviewService");

    await ReviewService.getReviewsByReviewer(
      validBody.project_id,
      "33333333-3333-4333-8333-333333333333",
      "33333333-3333-4333-8333-333333333333"
    );

    const [sql, options] = query.mock.calls[1];
    expect(sql).toContain("r.role_description");
    expect(sql).toContain("pm.task as reviewee_task");
    expect(sql).toContain("LEFT JOIN project_members pm");
    expect(options.replacements).toMatchObject({
      project_id: validBody.project_id,
      reviewer_id: "33333333-3333-4333-8333-333333333333",
    });
  });

  test("project review summary returns envelope while preserving legacy top-level fields", async () => {
    const getProjectReviewSummary = jest.fn().mockResolvedValue({
      average_rating: "4.4",
      total_reviews: "3",
      avg_ability: "4.2",
      avg_effort: "4.5",
      avg_commitment: "3.2",
      avg_communication: "3.8",
      avg_reflection: "4.1",
    });
    jest.doMock("../src/services/reviewService", () => ({
      getProjectReviewSummary,
    }));

    const { getProjectReviewSummary: getProjectReviewSummaryController } = require("../src/controllers/reviewController");
    const req = {
      params: {
        project_id: validBody.project_id,
      },
      user: {
        userId: "33333333-3333-4333-8333-333333333333",
      },
    };
    const res = createResponse();

    await getProjectReviewSummaryController(req, res);

    expect(getProjectReviewSummary).toHaveBeenCalledWith(
      validBody.project_id,
      "33333333-3333-4333-8333-333333333333"
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      averageRating: 4.4,
      totalReviews: 3,
      categoryAverages: {
        ability: 4.2,
        effort: 4.5,
        commitment: 3.2,
        communication: 3.8,
        reflection: 4.1,
      },
      summary: {
        strengths: expect.arrayContaining([
          "업무 능력이 뛰어나요",
          "노력을 많이 해요",
          "성찰 능력이 뛰어나요",
        ]),
        improvements: expect.arrayContaining([
          "책임감이 더 필요해요",
        ]),
      },
      data: {
        averageRating: 4.4,
        totalReviews: 3,
        categoryAverages: {
          ability: 4.2,
          effort: 4.5,
          commitment: 3.2,
          communication: 3.8,
          reflection: 4.1,
        },
        summary: {
          strengths: expect.any(Array),
          improvements: expect.any(Array),
        },
      },
    });
  });
});
