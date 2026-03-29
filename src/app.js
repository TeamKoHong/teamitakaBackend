require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { sequelize, connectDB } = require("./config/db");

// --- 라우트 파일 Import ---
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const devRoutes = require("./routes/devRoutes");
const userRoutes = require("./routes/userRoutes");
const recruitmentRoutes = require("./routes/recruitmentRoutes");
const commentRoutes = require("./routes/commentRoutes");
const projectPostRoutes = require("./routes/projectPostRoutes");
const projectRoutes = require("./routes/projectRoutes");
const searchRoutes = require("./routes/searchRoutes");
const profileRoutes = require("./routes/profileRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");
const draftRoutes = require("./routes/draftRoutes");
const scrapRoutes = require("./routes/scrapRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const smsRoutes = require("./routes/smsRoutes");
const findIdRoutes = require("./routes/findIdRoutes");

// ✅ [추가됨] 일정 라우트
const scheduleRoutes = require("./routes/scheduleRoutes");

const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const path = require('path');
const swaggerDocument = yaml.load(path.join(__dirname, '../swagger.yaml'));

const app = express();
const enableDevRoutes =
  process.env.ENABLE_DEV_ROUTES === "true" &&
  process.env.NODE_ENV !== "production";

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// --- CORS 설정 ---
const configuredCorsOrigin = process.env.CORS_ORIGIN || process.env.CORS_ORIGINS;
const allowAnyOrigin = process.env.ALLOW_ANY_ORIGIN === 'true';
const corsOrigin =
  configuredCorsOrigin ||
  (process.env.NODE_ENV === "production" ? null : "*");

if (process.env.NODE_ENV === "production" && allowAnyOrigin) {
  throw new Error("ALLOW_ANY_ORIGIN must not be enabled in production.");
}

if (process.env.NODE_ENV === "production" && !corsOrigin) {
  throw new Error("CORS_ORIGIN or CORS_ORIGINS must be configured in production.");
}

const parseOrigins = (originString) => {
  if (originString === '*') return originString;
  const origins = originString.split(',').map(o => o.trim());
  return origins.length === 1 ? origins[0] : origins;
};

const parsedOrigin = parseOrigins(corsOrigin);

const corsOptions = allowAnyOrigin
  ? {
      origin: (origin, callback) => callback(null, true),
      credentials: true,
      methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
      allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
      optionsSuccessStatus: 204,
    }
  : {
      origin: parsedOrigin,
      credentials: true,
      methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
      allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
      optionsSuccessStatus: 204,
    };

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// --- 라우트 등록 ---
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

if (enableDevRoutes) {
  app.use("/api/dev", devRoutes);
}

app.use("/api/user", userRoutes);
app.use("/api/recruitments", recruitmentRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/projects", projectPostRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/drafts", draftRoutes);
app.use("/api/scraps", scrapRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/auth", verificationRoutes);
app.use("/api/auth/sms", smsRoutes);
app.use("/api/auth/find-id", findIdRoutes);

// ✅ [추가됨] 일정 API 연결
// 프론트엔드 Calendar.jsx -> /api/schedule 사용
// Todo API는 /api/projects/:project_id/todo 경로로 projectRoutes에서 처리
app.use("/api/schedule", scheduleRoutes);

// 기본 라우트
app.get("/", (req, res) => {
  res.status(200).send("TEAMITAKA Backend Running!");
});

// 헬스체크 엔드포인트
app.get('/api/health', async (req, res) => {
  console.log('Received /api/health request');
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: 'OK', database: 'connected' });
  } catch (error) {
    console.error('🚨 Health check failed:', error.message);
    res.status(503).json({ status: 'ERROR', database: 'disconnected', error: error.message });
  }
});

// Swagger API 문서
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 앱 시작 시 DB 연결
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
