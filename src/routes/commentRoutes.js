const express = require("express");
const router = express.Router();

const { Recruitment, Comment, Like } = require("../models");
const { Op } = require("sequelize");
const authMiddleWare = require("../middlewares/auth-middleware");

// 특정 모집공고의 댓글 조회
router.get("/recruitments/:recruitment_id/comment", async (req, res) => {
  try {
    const { recruitment_id } = req.params;

    // 모집공고 존재 여부 확인
    const recruitment = await Recruitment.findByPk(recruitment_id);
    if (!recruitment) {
      return res.status(400).send({ message: "모집공고가 없습니다." });
    }

    const comment = await Comment.findAll({
      where: { recruitment_id: recruitment_id },
      order: [["created_at", "desc"]],
    });

    res.send(comment);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

// 특정 모집공고에 댓글 작성
router.post("/recruitment/:recruitment_id/comment", authMiddleWare, async (req, res) => {
  try {
    const { recruitment_id } = req.params;
    const { content } = req.body;
    const user_id = res.locals.user.user_id;

    // 모집공고 존재 여부 확인
    const recruitment = await Recruitment.findByPk(recruitment_id);
    if (!recruitment) {
      return res.status(400).send({ message: "모집공고가 없습니다." });
    }

    if (!content || content.trim() === "") {
      return res.status(400).send({ message: "댓글 내용을 입력해주세요." });
    }

    const comment = await Comment.create({
      content,
      recruitment_id: recruitment_id,
      user_id,
    });

    res.send(comment);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
