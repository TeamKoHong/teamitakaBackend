const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { sequelize } = require("../models"); // Sequelize 인스턴스 가져오기

const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const devRoutes = require("./routes/devRoutes");
const univCertRoutes = require("./routes/univCertRoutes");
const userRoutes = require("./routes/userRoutes");
const recruitmentRoutes = require("./routes/recruitmentRoutes");
const commentRoutes = require("./routes/commentRoutes");
const projectRoutes = require("./routes/projectRoutes");
const searchRoutes = require("./routes/searchRoutes");
const profileRoutes = require("./routes/profileRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

console.log("✅ recruitmentRoutes: ", recruitmentRoutes);

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// 라우트 등록
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dev", devRoutes);
app.use("/api/univcert", univCertRoutes);
app.use("/api/user", userRoutes);
app.use("/api/recruitment", recruitmentRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/reviews", reviewRoutes);

// 기본 라우트
app.get("/", (req, res) => {
  res.status(200).send("Teamitaka Backend Running!");
});

// 헬스체크 엔드포인트
app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate(); // DB 연결 확인
    res.status(200).json({ status: "OK", database: "connected" });
  } catch (error) {
    console.error("🚨 Health check failed:", error.message);
    res.status(503).json({ status: "ERROR", database: "disconnected", error: error.message });
  }
});

module.exports = app;