jest.mock("../src/models", () => ({
  Project: {
    findByPk: jest.fn(),
  },
  ProjectMembers: {
    findOne: jest.fn(),
  },
  Timeline: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  ProjectPost: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  User: {},
}));

const {
  Project,
  ProjectMembers,
  Timeline,
  ProjectPost,
} = require("../src/models");
const timelineController = require("../src/controllers/timelineController");
const projectPostController = require("../src/controllers/projectPostController");

const userId = "22222222-2222-4222-8222-222222222222";
const projectId = "33333333-3333-4333-8333-333333333333";
const eventId = "44444444-4444-4444-8444-444444444444";
const postId = "55555555-5555-4555-8555-555555555555";
const otherProjectId = "66666666-6666-4666-8666-666666666666";

const makeReq = ({ params = {}, body = {} } = {}) => ({
  params,
  body,
  user: { userId },
});

const makeRes = () => {
  const res = {
    statusCode: 200,
    body: undefined,
    status: jest.fn((code) => {
      res.statusCode = code;
      return res;
    }),
    json: jest.fn((payload) => {
      res.body = payload;
      return res;
    }),
  };
  return res;
};

const mockExistingProjectForNonMember = () => {
  Project.findByPk.mockResolvedValueOnce({
    project_id: projectId,
    user_id: "owner-user",
  });
  ProjectMembers.findOne.mockResolvedValueOnce(null);
};

describe("project internal permission contracts", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test("GET timeline rejects non-members before reading timeline data", async () => {
    mockExistingProjectForNonMember();
    const req = makeReq({ params: { project_id: projectId } });
    const res = makeRes();

    await timelineController.getTimeline(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/프로젝트 멤버/);
    expect(Timeline.findAll).not.toHaveBeenCalled();
  });

  test("POST timeline rejects non-members before creating events", async () => {
    mockExistingProjectForNonMember();
    const req = makeReq({
      params: { project_id: projectId },
      body: {
        event_title: "킥오프",
        description: "초기 회의",
        date: "2026-05-10T00:00:00.000Z",
      },
    });
    const res = makeRes();

    await timelineController.addTimelineEvent(req, res);

    expect(res.statusCode).toBe(403);
    expect(Timeline.create).not.toHaveBeenCalled();
  });

  test("PUT timeline rejects non-members before loading or mutating events", async () => {
    mockExistingProjectForNonMember();
    const req = makeReq({
      params: { project_id: projectId, event_id: eventId },
      body: { event_title: "변경 시도" },
    });
    const res = makeRes();

    await timelineController.updateTimelineEvent(req, res);

    expect(res.statusCode).toBe(403);
    expect(Timeline.findByPk).not.toHaveBeenCalled();
  });

  test("PUT timeline does not mutate when URL project and event project differ", async () => {
    const update = jest.fn();
    Project.findByPk.mockResolvedValueOnce({
      project_id: projectId,
      user_id: "owner-user",
    });
    ProjectMembers.findOne.mockResolvedValueOnce({
      project_id: projectId,
      user_id: userId,
      role: "팀원",
    });
    Timeline.findByPk.mockResolvedValueOnce({
      timeline_id: eventId,
      project_id: otherProjectId,
      update,
    });
    const req = makeReq({
      params: { project_id: projectId, event_id: eventId },
      body: { event_title: "교차 프로젝트 수정" },
    });
    const res = makeRes();

    await timelineController.updateTimelineEvent(req, res);

    expect(res.statusCode).toBe(404);
    expect(update).not.toHaveBeenCalled();
  });

  test("DELETE timeline rejects non-members before loading or deleting events", async () => {
    mockExistingProjectForNonMember();
    const req = makeReq({ params: { project_id: projectId, event_id: eventId } });
    const res = makeRes();

    await timelineController.deleteTimelineEvent(req, res);

    expect(res.statusCode).toBe(403);
    expect(Timeline.findByPk).not.toHaveBeenCalled();
  });

  test("DELETE timeline does not delete when URL project and event project differ", async () => {
    const destroy = jest.fn();
    Project.findByPk.mockResolvedValueOnce({
      project_id: projectId,
      user_id: "owner-user",
    });
    ProjectMembers.findOne.mockResolvedValueOnce({
      project_id: projectId,
      user_id: userId,
      role: "팀원",
    });
    Timeline.findByPk.mockResolvedValueOnce({
      timeline_id: eventId,
      project_id: otherProjectId,
      destroy,
    });
    const req = makeReq({ params: { project_id: projectId, event_id: eventId } });
    const res = makeRes();

    await timelineController.deleteTimelineEvent(req, res);

    expect(res.statusCode).toBe(404);
    expect(destroy).not.toHaveBeenCalled();
  });

  test("GET project posts rejects non-members before returning feed data", async () => {
    mockExistingProjectForNonMember();
    const req = makeReq({ params: { project_id: projectId } });
    const res = makeRes();

    await projectPostController.getPostsByProject(req, res);

    expect(res.statusCode).toBe(403);
    expect(ProjectPost.findAll).not.toHaveBeenCalled();
  });

  test("POST project posts rejects non-members before creating posts", async () => {
    mockExistingProjectForNonMember();
    const req = makeReq({
      params: { project_id: projectId },
      body: { title: "공유", content: "프로젝트 내부 피드" },
    });
    const res = makeRes();

    await projectPostController.createPost(req, res);

    expect(res.statusCode).toBe(403);
    expect(ProjectPost.create).not.toHaveBeenCalled();
  });

  test("GET project post detail rejects non-members before loading hydrated post data", async () => {
    ProjectPost.findByPk.mockResolvedValueOnce({
      post_id: postId,
      project_id: projectId,
    });
    mockExistingProjectForNonMember();
    const req = makeReq({ params: { post_id: postId } });
    const res = makeRes();

    await projectPostController.getPostById(req, res);

    expect(res.statusCode).toBe(403);
    expect(ProjectPost.findByPk).toHaveBeenCalledTimes(1);
    expect(ProjectPost.findByPk).not.toHaveBeenCalledWith(
      postId,
      expect.objectContaining({ include: expect.any(Array) })
    );
  });
});
