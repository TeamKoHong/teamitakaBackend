const express = require("express");
const router = express.Router();
const { Recruitment, Scrap, User } = require("../models");
const authMiddleWare = require("../middlewares/auth-middleware");

// 사용자가 스크랩한 모집공고 목록 조회
router.get("/scraps/recruitments", authMiddleWare, async (req, res) => {
  const user_id = res.locals.user.userId;
  console.log(res.locals.user);

  const data = await Scrap.findAll({
    where: { user_id: user_id },
    raw: true,
    attributes: ["Recruitment.user_id", "Recruitment.title", "Recruitment.content", "Recruitment.scrap_cnt"],
    include: [
      {
        model: Recruitment,
        attributes: [],
      },
    ],
    order: [[Recruitment, "scrap_cnt", "desc"]],
  });

  console.log("********", data);

  res.status(200).json({ data });
});

// 모집공고 스크랩 추가/삭제
router.put("/recruitment/:recruitment_id/scrap", authMiddleWare, async (req, res) => {
  const user_id = res.locals.user.user_id;
  const { recruitment_id } = req.params;

  const existScrap = await Scrap.findOne({
    where: { user_id, recruitment_id: recruitment_id },
  });

  try {
    if (!existScrap) {
      await Scrap.create({
        user_id: user_id,
        recruitment_id: recruitment_id,
      });

      await Recruitment.increment({ scrap_cnt: 1 }, { where: { recruitment_id } });
      return res.status(200).send("스크랩 추가");
    } else {
      await Scrap.destroy({
        where: { user_id, recruitment_id: recruitment_id },
      });

      await Recruitment.decrement({ scrap_cnt: 1 }, { where: { recruitment_id } });
      return res.status(200).send("스크랩 취소");
    }
  } catch (error) {
    res.status(400).send({ errorMessage: "모집공고 스크랩에 실패하였습니다." });
  }
});

module.exports = router;
