const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");

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
    const { title, content, description, status } = req.body;
    const user_id = res.locals.user.user_id;
    const created_at = new Date(); // 현재 시간 설정
    //const project_id = res.locals.project.project_id
    try {
      const recruitment = await Recruitment.create({
        title,
        content,
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

//모집공고 수정
  router.put("/recruitment/:recruitment_id", authMiddleWare, async (req, res) => {
    try {
      const { recruitment_id } = req.params;
      const { title, content, description, status } = req.body;
  
      // 모집공고 존재 여부 확인
      const recruitment = await Recruitment.findByPk(recruitment_id);
      if (!recruitment) {
        return res.status(400).send({ message: "모집공고가 존재하지 않습니다." });
      }
  
      // 모집공고 업데이트
      await Recruitment.update(
        { title, content, description, status },
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