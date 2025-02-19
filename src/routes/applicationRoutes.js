const express = require("express");
const router = express.Router();
const authMiddleWare = require("../middlewares/auth-middleware");
const { Recruitment, Application, User } = require("../models");

// ✅ 모집공고 지원하기
router.post("/applications/:recruitment_id", authMiddleWare, async (req, res) => {
  const { recruitment_id } = req.params;
  const user_id = res.locals.user.user_id;

  try {
    const recruitment = await Recruitment.findByPk(recruitment_id);
    if (!recruitment) return res.status(404).send({ message: "모집공고가 존재하지 않습니다." });

    // 중복 지원 방지
    const existingApplication = await Application.findOne({ where: { recruitment_id, user_id } });
    if (existingApplication) return res.status(400).send({ message: "이미 지원한 모집공고입니다." });

    // 지원 정보 저장
    const application = await Application.create({ recruitment_id, user_id });
    res.status(201).send(application);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

// ✅ 특정 모집공고의 지원자 목록 조회
router.get("/applications/:recruitment_id", authMiddleWare, async (req, res) => {
    const { recruitment_id } = req.params;
  
    try {
      const applications = await Application.findAll({
        where: { recruitment_id },
        include: [{ model: User, attributes: ["user_id", "username", "email"] }], // 지원자의 기본 정보 포함
      });
  
      res.status(200).send(applications);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  });
  
  // ✅ 모집공고 지원 승인
  router.patch("/applications/:application_id/approve", authMiddleWare, async (req, res) => {
    const { application_id } = req.params;
  
    try {
      const application = await Application.findByPk(application_id);
      if (!application) return res.status(404).send({ message: "지원 정보를 찾을 수 없습니다." });
  
      application.status = "APPROVED"; // 지원 승인
      await application.save();
  
      res.status(200).send({ message: "지원이 승인되었습니다.", application });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  });
  
  // ✅ 모집공고 지원 거절
  router.patch("/applications/:application_id/reject", authMiddleWare, async (req, res) => {
    const { application_id } = req.params;
  
    try {
      const application = await Application.findByPk(application_id);
      if (!application) return res.status(404).send({ message: "지원 정보를 찾을 수 없습니다." });
  
      application.status = "REJECTED"; // 지원 거절
      await application.save();
  
      res.status(200).send({ message: "지원이 거절되었습니다.", application });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  });
  
  module.exports = router;