//like를 scrap으로 수정필요요
const express = require("express");
const router = express.Router();
const { Recruitment, Like } = require("../models");
const authMiddleWare = require("../middlewares/authMiddleware");

router.get("/likes/recruitments", authMiddleWare, async (res) => {
  const user_id = res.locals.user.userId;
  console.log(res.locals.user);

  const data = await Like.findAll({
    where: { user_id: user_id },
    raw: true,
    attributes: ["Recruitment.user_id", "Recruitment.title", "Recruitment.content", "Recruitment.like_cnt"],
    include: [
      {
        model: Recruitment,
        attributes: [],
      },
    ],
    order: [[Recruitment, "like_cnt", "desc"]],
  });

  console.log("********", data);

  res.status(200).json({ data });
});

router.put("/recruitment/:recruitment_id/like", authMiddleWare, async (req, res) => {
  const user_id = res.locals.user.user_id;
  const { recruitment_id } = req.params;

  const existlike = await Like.findOne({
    where: { user_id, recruitment_id: recruitment_id },
  });

  try {
    if (!existlike) {
      await Like.create({
        user_id: user_id,
        recruitment_id: recruitment_id,
      });

      await Recruitment.increment({ like_cnt: 1 }, { where: { recruitment_id } });
      return res.status(200).send("좋아요");
    } else {
      Like.destroy({
        where: { recruitment_id: recruitment_id },
      });

      await Recruitment.decrement({ like_cnt: 1 }, { where: { recruitment_id } });
      return res.status(200).send("안 좋아요");
    }
  } catch {
    res.status(400).send({ errorMessage: "모집공고 좋아요에 실패하였습니다." });
  }
});

module.exports = router;
