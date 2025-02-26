const express = require("express");
const router = express.Router();
//const reviewController = require("../controllers/reviewController");  // 컨트롤러 임포트
const authMiddleware = require("../middlewares/authMiddleware");  // 인증 미들웨어 임포트

module.exports = router;
