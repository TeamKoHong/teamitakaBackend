const express = require("express");
const router = express.Router();
const recruitmentController = require("../controllers/recruitmentController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.get("/recruitment", recruitmentController.getAllRecruitments);
router.get("/recruitment/:recruitment_id", recruitmentController.getRecruitmentById);
router.post("/recruitment", authMiddleware, upload.single("photo"), recruitmentController.createRecruitment);
router.put("/recruitment/:recruitment_id", authMiddleware, recruitmentController.updateRecruitment);
router.delete("/recruitment/:recruitment_id", authMiddleware, recruitmentController.deleteRecruitment);

module.exports = router;
