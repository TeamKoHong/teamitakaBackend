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
