require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { sequelize } = require("./models"); // Sequelize 인스턴스 가져오기

const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const devRoutes = require("./routes/devRoutes");
const univCertRoutes = require("./routes/univCertRoutes");
const userRoutes = require("./routes/userRoutes");
const recruitmentRoutes = require("./routes/recruitmentRoutes");
const commentRoutes = require("./routes/commentRoutes");
const projectRoutes = require("./routes/projectRoutes");
const searchRoutes = require("./routes/searchRoutes");
const profileRoutes = require("./routes/profileRoutes");//프로필
const reviewRoutes = require("./routes/reviewRoutes"); // ✅ 리뷰 라우트 추가
const draftRoutes = require("./routes/draftRoutes");  // draftRoutes 추가
const scrapRoutes = require("./routes/scrapRoutes");  // scrapRoutes 추가
const applicationRoutes = require("./routes/applicationRoutes"); 

const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const path = require('path');
const swaggerDocument = yaml.load(path.join(__dirname, '../swagger.yaml'));

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 파싱

app.use(morgan("dev"));

// 라우트 등록
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dev", devRoutes);
app.use("/api/univcert", univCertRoutes);
app.use("/api/user", userRoutes);
app.use("/api/recruitment", recruitmentRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/reviews", reviewRoutes); // ✅ 리뷰 라우트 추가
app.use("/api/drafts", draftRoutes);    // draftRoutes 라우트 추가
app.use("/api/scraps", scrapRoutes); 
app.use("/api/applications", applicationRoutes); 

// 기본 라우트
app.get("/", (req, res) => {
  res.status(200).send("Teamitaka Backend Running!");
});

// 헬스체크 엔드포인트
app.get('/health', async (req, res) => {
  console.log('Received /health request'); // Debug log
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: 'OK', database: 'connected' });
  } catch (error) {
    console.error('🚨 Health check failed:', error.message);
    res.status(503).json({ status: 'ERROR', database: 'disconnected', error: error.message });
  }
});

// swagger 라우트 추가
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;