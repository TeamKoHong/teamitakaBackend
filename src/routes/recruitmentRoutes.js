const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const { Recruitment, Project, Comment, Scrap, Hashtag } = require("../models");

const { Op } = require("sequelize");
const authMiddleware = require("../middlewares/authMiddleware"); // 수정된 경로

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

// 쿠키에서 조회 여부 확인
    let viewedRecruitments = req.cookies.viewedRecruitments
      ? JSON.parse(req.cookies.viewedRecruitments)
      : [];

    if (!viewedRecruitments.includes(recruitment_id)) {
      // 조회수 증가
      await Recruitment.increment("views", { where: { recruitment_id } });

      // 쿠키에 저장 (1시간 동안 유지)
      viewedRecruitments.push(recruitment_id);
      res.cookie("viewedRecruitments", JSON.stringify(viewedRecruitments), {
        maxAge: 60 * 60 * 1000, // 1시간
        httpOnly: true,
      });
    }

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

// ✅ 모집공고 작성 (임시저장 포함)
router.post("/recruitment", authMiddleware, async (req, res) => {
  try {
    const { title, description, status, start_date, end_date, hashtags, is_draft } = req.body;
    const user_id = res.locals.user.user_id;

    const recruitment = await Recruitment.create({
      title,
      description,
      status: is_draft ? "임시저장" : status,
      start_date,
      end_date,
      user_id,
      is_draft: is_draft || false,
    });

    // 해시태그 저장
    if (hashtags && hashtags.length > 0) {
      const hashtagPromises = hashtags.map(async (tag) => {
        const [hashtag] = await Hashtag.findOrCreate({ where: { content: tag } });
        return hashtag;
      });

      const hashtagResults = await Promise.all(hashtagPromises);
      await recruitment.addHashtags(hashtagResults);
    }

    res.status(201).json(recruitment);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

// 모집공고 수정
router.put("/recruitment/:recruitment_id", authMiddleware, async (req, res) => {
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
router.delete("/recruitment/:recruitment_id", authMiddleware, async (req, res) => {
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
