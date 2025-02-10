const express = require("express");
const router = express.Router();
const univCertController = require("../controllers/univCertController");

router.post("/send-otp", univCertController.sendVerificationCode);
router.post("/verify-otp", univCertController.verifyCode); // ✅ verifyCode 라우트 추가

module.exports = router;
