const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const { Recruitment, Project } = require("../models");

const { Recruitment, Comment, Like } = require("../models");
const { Op } = require("sequelize");
const authMiddleWare = require("../middlewares/auth-middleware");

const app = express();
app.use(cookieParser());

// 전체 모집공고 조회
router.get("/recruitment", async (req, res) => {
  try {
    const recruitment = await Recruitment.findAll({ order: [["createdAt", "desc"]] });
    
    res.send(recruitment);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

// 특정 모집공고 조회
router.get("/recruitment/:recruitment_id", async (req, res) => {
  try {
    const { recruitment_id } = req.params;
    const recruitment = await Recruitment.findByPk(recruitment_id);

    console.log(recruitment);
    res.send(recruitment);
  } catch (error) {
    console.error(error);

    res.status(500).send({ message: error.message });
  }
});

//모집공고 작성
router.post("/recruitment", authMiddleWare, async (req, res) => {
    const { title, description, status } = req.body;
    const user_id = res.locals.user.user_id;
    const created_at = new Date(); // 현재 시간 설정
    //const project_id = res.locals.project.project_id
    try {
      const recruitment = await Recruitment.create({
        title,
        description,
        status,
        user_id,
        created_at,
        //project_id,
      });
  
      res.send(recruitment);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  });


//수정정
  router.put("/recruitment/:recruitment_id", authMiddleWare, async (req, res) => {
    try {
      const { recruitment_id } = req.params;
      const { title, description, status } = req.body;
  
      // 모집공고 찾기
      const recruitment = await Recruitment.findByPk(recruitment_id);
      if (!recruitment) {
        return res.status(400).send({ message: "모집공고가 존재하지 않습니다." });
      }
  
      // 모집 상태가 'closed'로 변경될 때 프로젝트 생성
      if (status === "closed" && recruitment.status !== "closed") {
        // 이미 프로젝트가 생성된 경우 중복 생성 방지
        const existingProject = await Project.findOne({ where: { recruitment_id } });
        if (existingProject) {
          return res.status(400).send({ message: "이미 프로젝트가 생성된 모집공고입니다." });
        }
  
        // 프로젝트 생성
        const newProject = await Project.create({
          title: recruitment.title,
          description: recruitment.description,
          user_id: recruitment.user_id, // 모집공고 작성자가 프로젝트 생성자로 설정
          recruitment_id: recruitment.recruitment_id, // 모집공고 ID 연결
          created_at: new Date(),
        });
  
        console.log(`모집공고가 프로젝트로 전환됨: ${newProject.project_id}`);
      }
  
      // 모집공고 상태 업데이트
      await Recruitment.update(
        { title, description, status },
        { where: { recruitment_id } }
      );
  
      res.send({ message: "모집공고가 수정되었습니다." });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  });

// 특정 모집공고 삭제
router.delete("/recruitment/:recruitment_id", authMiddleWare, async (req, res) => {
  try {
    const { recruitment_id } = req.params;

    //모집공고 삭제
    const deletedCount = await Recruitment.destroy({
      where: { recruitment_id },
    });

    if (deletedCount === 0) {
      return res.status(400).send({ message: " 삭제할 모집공고가 없습니다." });
    }

    res.send({ message: "모집공고가 삭제되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;