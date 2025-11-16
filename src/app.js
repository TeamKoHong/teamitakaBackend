require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser"); // 추가
const { sequelize, connectDB } = require("./config/db"); // DB 연결 함수 import

const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const devRoutes = require("./routes/devRoutes");

const userRoutes = require("./routes/userRoutes");
const recruitmentRoutes = require("./routes/recruitmentRoutes");
const commentRoutes = require("./routes/commentRoutes");
const projectPostRoutes = require("./routes/projectPostRoutes");
const projectRoutes = require("./routes/projectRoutes");
const searchRoutes = require("./routes/searchRoutes");
const profileRoutes = require("./routes/profileRoutes");//프로필
const reviewRoutes = require("./routes/reviewRoutes"); // ✅ 리뷰 라우트 추가
const draftRoutes = require("./routes/draftRoutes");  // draftRoutes 추가
const scrapRoutes = require("./routes/scrapRoutes");  // scrapRoutes 추가
const applicationRoutes = require("./routes/applicationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes"); // ✅ 대시보드 라우트 추가
const uploadRoutes = require("./routes/uploadRoutes"); // ✅ 업로드 라우트 추가

const verificationRoutes = require("./routes/verificationRoutes");

// const swaggerUi = require('swagger-ui-express');
// const yaml = require('yamljs');
// const path = require('path');
// const swaggerDocument = yaml.load(path.join(__dirname, '../swagger.yaml'));

const app = express();
const corsOrigin = process.env.CORS_ORIGIN || '*';
const allowAnyOrigin = process.env.ALLOW_ANY_ORIGIN === 'true';
const corsOptions = allowAnyOrigin
  ? {
      origin: (origin, callback) => callback(null, true),
      credentials: true,
      methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
      allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
      optionsSuccessStatus: 204,
    }
  : { origin: corsOrigin, credentials: true };

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 파싱
app.use(cookieParser()); // 추가
app.use(morgan("dev"));

// 라우트 등록
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dev", devRoutes);

app.use("/api/user", userRoutes);
app.use("/api/recruitments", recruitmentRoutes);
app.use("/api/comments", commentRoutes); // 복수형으로 수정
app.use("/api/projects", projectPostRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/reviews", reviewRoutes); // ✅ 리뷰 라우트 추가
app.use("/api/drafts", draftRoutes);    // draftRoutes 라우트 추가
app.use("/api/scraps", scrapRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/dashboard", dashboardRoutes); // ✅ 대시보드 라우트 추가
app.use("/api/upload", uploadRoutes); // ✅ 업로드 라우트 추가

app.use("/api/auth", verificationRoutes);

// 기본 라우트
app.get("/", (req, res) => {
  res.status(200).send("TEAMITAKA Backend Running!");
});

// 헬스체크 엔드포인트
app.get('/api/health', async (req, res) => {
  console.log('Received /api/health request'); // Debug log
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: 'OK', database: 'connected' });
  } catch (error) {
    console.error('🚨 Health check failed:', error.message);
    res.status(503).json({ status: 'ERROR', database: 'disconnected', error: error.message });
  }
});

// swagger 라우트 추가 (임시 비활성화)
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 앱 시작 시 DB 연결 시도 (테스트 환경 제외)
if (process.env.NODE_ENV !== 'test') {
  const startApp = async () => {
    console.log("🚀 Starting application...");
    const dbConnected = await connectDB();
    if (!dbConnected) {
      console.error("❌ Failed to connect to database. Application may not work properly.");
    }
    console.log("✅ Application setup completed.");
  };
  startApp();
}

module.exports = app;