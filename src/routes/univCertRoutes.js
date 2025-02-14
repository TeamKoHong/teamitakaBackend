const express = require("express");
const router = express.Router();
const univCertController = require("../controllers/univCertController");

router.post("/send-otp", univCertController.sendOtp);
router.post("/verify-otp", univCertController.verifyOtp); // ✅ verifyCode 라우트 추가

module.exports = router;
