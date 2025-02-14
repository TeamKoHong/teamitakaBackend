const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { connectDB } = require("./src/config/db");

const app = express();
connectDB();

app.use(cors());
app.use(express.json()); // POST 요청을 JSON으로 받기 위해 필요
app.use(morgan("dev"));

// 📌 UnivCert 이메일 인증 API 라우트 추가
const univCertRoutes = require("./src/routes/univCertRoutes");
app.use("/api/univcert", univCertRoutes);

// 📌 관리자 API 라우트 추가 (index.js에서 제거됨)
const adminRoutes = require("./src/routes/adminRoutes");
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Teamitaka Backend Running!");
});

module.exports = app;
