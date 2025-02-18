const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const { Recruitment, Project, Comment, Scrap, Hashtag } = require("../models");
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
    const recruitment = await Recruitment.findByPk(recruitment_id, {
      include: [{ model: Hashtag, attributes: ["content"] }],
    });

    if (!recruitment) {
      return res.status(404).send({ message: "모집공고를 찾을 수 없습니다." });
    }

    res.send(recruitment);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

// 모집공고 작성
router.post("/recruitment", authMiddleWare, async (req, res) => {
  const { title, description, status, start_date, end_date, hashtags } = req.body;
  const user_id = res.locals.user.user_id;
  const created_at = new Date(); 

  try {
    const recruitment = await Recruitment.create({
      title,
      description,
      status,
      user_id,
      start_date,
      end_date,
      created_at,
    });

    // 해시태그 처리
    if (hashtags && hashtags.length > 0) {
      const hashtagPromises = hashtags.map(async (tag) => {
        const [hashtag] = await Hashtag.findOrCreate({ where: { content: tag } });
        return hashtag;
      });

      const hashtagResults = await Promise.all(hashtagPromises);
      await recruitment.addHashtags(hashtagResults);
    }

    res.send(recruitment);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

// 모집공고 수정
router.put("/recruitment/:recruitment_id", authMiddleWare, async (req, res) => {
  try {
    const { recruitment_id } = req.params;
    const { title, description, status, start_date, end_date, hashtags } = req.body;

    const recruitment = await Recruitment.findByPk(recruitment_id);
    if (!recruitment) {
      return res.status(400).send({ message: "모집공고가 존재하지 않습니다." });
    }

    // 모집 상태가 'closed'로 변경될 때 프로젝트 생성
    if (status === "closed" && recruitment.status !== "closed") {
      const existingProject = await Project.findOne({ where: { recruitment_id } });
      if (existingProject) {
        return res.status(400).send({ message: "이미 프로젝트가 생성된 모집공고입니다." });
      }

      const newProject = await Project.create({
        title: recruitment.title,
        description: recruitment.description,
        user_id: recruitment.user_id,
        recruitment_id: recruitment.recruitment_id,
        created_at: new Date(),
      });

      console.log(`모집공고가 프로젝트로 전환됨: ${newProject.project_id}`);
    }

    await Recruitment.update({ title, description, status, start_date, end_date }, { where: { recruitment_id } });

    // 업데이트 후 모집공고 다시 조회
    const updatedRecruitment = await Recruitment.findByPk(recruitment_id);
    if (hashtags && hashtags.length > 0) {
      const hashtagPromises = hashtags.map(async (tag) => {
        const [hashtag] = await Hashtag.findOrCreate({ where: { content: tag } });
        return hashtag;
      });

      const hashtagResults = await Promise.all(hashtagPromises);
      await updatedRecruitment.setHashtags(hashtagResults);
    }

    res.send({ message: "모집공고가 수정되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

// 모집공고 삭제
router.delete("/recruitment/:recruitment_id", authMiddleWare, async (req, res) => {
  try {
    const { recruitment_id } = req.params;

    const recruitment = await Recruitment.findByPk(recruitment_id);
    if (!recruitment) {
      return res.status(400).send({ message: "삭제할 모집공고가 없습니다." });
    }

    await recruitment.setHashtags([]); // 해시태그 관계 해제
    await recruitment.destroy();

    res.send({ message: "모집공고가 삭제되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
