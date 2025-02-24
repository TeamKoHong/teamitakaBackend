// routes/projectRoutes.js

const express = require("express");
const router = express.Router();
const { Project, Recruitment, Hashtag, User } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");
const { Op } = require("sequelize");

// ✅ 1. 전체 프로젝트 조회
router.get("/projects", async (req, res) => {
  try {
    const projects = await Project.findAll({
      order: [["created_at", "DESC"]],
      include: [{ model: User, attributes: ["username"] }],
      attributes: ["role"], // ✅ 역할 추가
    });
    res.status(200).send(projects);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

// ✅ 2. 특정 프로젝트 조회
router.get("/projects/:project_id", async (req, res) => {
  try {
    const { project_id } = req.params;

    const project = await Project.findByPk(project_id, {
      include: [
        { model: Hashtag, attributes: ["content"] },
        { model: User, attributes: ["username"] },
      ],
    });

    if (!project) {
      return res.status(404).send({ message: "프로젝트를 찾을 수 없습니다." });
    }

    res.status(200).send(project);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

// ✅ 완료된 프로젝트 조회
router.get("/projects/completed", authMiddleware, async (req, res) => {
  try {
    const user_id = res.locals.user.user_id;

    const completedProjects = await Project.findAll({
      where: {
        user_id,
        status: "완료",
      },
      include: [{ model: User, attributes: ["username"] }],
      order: [["updatedAt", "DESC"]],
    });

    res.status(200).json(completedProjects);
  } catch (error) {
    console.error("❌ Error fetching completed projects:", error);
    res.status(500).json({ message: "완료된 프로젝트 조회 실패" });
  }
});

// ✅ 오늘의 할 일 조회
router.get("/projects/:project_id/todo", async (req, res) => {
  const { project_id } = req.params;
  try {
    const todos = await Todo.findAll({
      where: { project_id },
      order: [["createdAt", "ASC"]],
    });
    res.status(200).json(todos);
  } catch (error) {
    console.error("❌ Error fetching todos:", error);
    res.status(500).json({ message: "서버 에러" });
  }
});

// ✅ 할 일 추가
router.post("/projects/:project_id/todo", authMiddleware, async (req, res) => {
  try {
    const { project_id } = req.params;
    const { content, is_completed } = req.body;

    const newTodo = await Todo.create({
      project_id,
      content,
      is_completed: is_completed || false,
    });

    res.status(201).json(newTodo);
  } catch (error) {
    console.error("❌ Error creating todo:", error);
    res.status(500).json({ message: "할 일 추가 실패" });
  }
});

// ✅ 할 일 상태 변경
router.put("/projects/:project_id/todo/:todo_id", authMiddleware, async (req, res) => {
  try {
    const { todo_id } = req.params;
    const { is_completed } = req.body;

    const todo = await Todo.findByPk(todo_id);
    if (!todo) return res.status(404).json({ message: "할 일을 찾을 수 없습니다." });

    await todo.update({ is_completed });
    res.json(todo);
  } catch (error) {
    console.error("❌ Error updating todo:", error);
    res.status(500).json({ message: "할 일 수정 실패" });
  }
});

// ✅ 할 일 삭제
router.delete("/projects/:project_id/todo/:todo_id", authMiddleware, async (req, res) => {
  try {
    const { todo_id } = req.params;

    const todo = await Todo.findByPk(todo_id);
    if (!todo) return res.status(404).json({ message: "할 일을 찾을 수 없습니다." });

    await todo.destroy();
    res.json({ message: "할 일이 삭제되었습니다." });
  } catch (error) {
    console.error("❌ Error deleting todo:", error);
    res.status(500).json({ message: "할 일 삭제 실패" });
  }
});


//타임라인
router.get("/projects/:project_id/timeline", async (req, res) => {
  try {
    const { project_id } = req.params;

    const timeline = await Timeline.findAll({
      where: { project_id },
      order: [["date", "ASC"]],
    });

    res.status(200).json(timeline);
  } catch (error) {
    console.error("❌ Error fetching timeline:", error);
    res.status(500).json({ message: "서버 에러" });
  }
});

// ✅ 타임라인 추가
router.post("/projects/:project_id/timeline", authMiddleware, async (req, res) => {
  try {
    const { project_id } = req.params;
    const { event, date } = req.body;

    const newEvent = await Timeline.create({
      project_id,
      event,
      date,
    });

    res.status(201).json(newEvent);
  } catch (error) {
    console.error("❌ Error creating timeline event:", error);
    res.status(500).json({ message: "타임라인 이벤트 추가 실패" });
  }
});

// ✅ 타임라인 수정
router.put("/projects/:project_id/timeline/:event_id", authMiddleware, async (req, res) => {
  try {
    const { event_id } = req.params;
    const { event, date } = req.body;

    const timelineEvent = await Timeline.findByPk(event_id);
    if (!timelineEvent) return res.status(404).json({ message: "이벤트를 찾을 수 없습니다." });

    await timelineEvent.update({ event, date });
    res.json(timelineEvent);
  } catch (error) {
    console.error("❌ Error updating timeline event:", error);
    res.status(500).json({ message: "타임라인 이벤트 수정 실패" });
  }
});

// ✅ 타임라인 삭제
router.delete("/projects/:project_id/timeline/:event_id", authMiddleware, async (req, res) => {
  try {
    const { event_id } = req.params;

    const timelineEvent = await Timeline.findByPk(event_id);
    if (!timelineEvent) return res.status(404).json({ message: "이벤트를 찾을 수 없습니다." });

    await timelineEvent.destroy();
    res.json({ message: "타임라인 이벤트가 삭제되었습니다." });
  } catch (error) {
    console.error("❌ Error deleting timeline event:", error);
    res.status(500).json({ message: "타임라인 이벤트 삭제 실패" });
  }
});


// ✅ 3. 프로젝트 수정
router.put("/projects/:project_id", authMiddleware, async (req, res) => {
  try {
    const { project_id } = req.params;
    const { project_name, description, start_date, end_date, project_image_url, status } = req.body;

    const project = await Project.findByPk(project_id);
    if (!project) {
      return res.status(404).send({ message: "프로젝트를 찾을 수 없습니다." });
    }

    await Project.update(
      { project_name, description, start_date, end_date, project_image_url, status, updated_at: new Date() },
      { where: { project_id } }
    );

    const updatedProject = await Project.findByPk(project_id);
    res.status(200).send(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

// ✅ 4. 프로젝트 삭제
router.delete("/projects/:project_id", authMiddleware, async (req, res) => {
  try {
    const { project_id } = req.params;

    const project = await Project.findByPk(project_id);
    if (!project) {
      return res.status(404).send({ message: "프로젝트를 찾을 수 없습니다." });
    }

    await project.destroy();
    res.status(200).send({ message: "프로젝트가 삭제되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

// ✅ 팀원 목록 조회
router.get("/project/:project_id/members", async (req, res) => {
    try {
      const { project_id } = req.params;
  
      const members = await ProjectMember.findAll({
        where: { project_id },
        include: [{ model: User, attributes: ["username", "email"] }],
      });
  
      res.status(200).json(members);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  });
  
  // ✅ 팀원 추가
  router.post("/project/:project_id/members", authMiddleware, async (req, res) => {
    try {
      const { project_id } = req.params;
      const { user_id, role } = req.body;
  
      const newMember = await ProjectMember.create({
        project_id,
        user_id,
        role: role || "팀원",
      });
  
      res.status(201).json(newMember);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  });

module.exports = router;
