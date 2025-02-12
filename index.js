require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 📌 이메일 인증 API 라우트 추가
const univCertRoutes = require("./src/routes/univCertRoutes");
app.use("/api/univcert", univCertRoutes);

// 📌 관리자 전용 API 추가
const adminRoutes = require("./src/routes/adminRoutes");
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Teamitaka Backend Running!");
});

// ✅ 테스트 환경에서는 서버 실행 안 함
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
