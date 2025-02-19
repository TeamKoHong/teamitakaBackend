// src/app.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser"); // ✅ 추가

const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const devRoutes = require("./routes/devRoutes");
const univCertRoutes = require("./routes/univCertRoutes");
const userRoutes = require("./routes/userRoutes"); // ← 새로 추가
const recruitmentRoutes = require("./routes/recruitmentRoutes");// ← 새로 추가
const commentRoutes = require("./routes/commentRoutes");// ← 새로 추가
const likeRoutes = require("./routes/likeRoutes");// ← 새로 추가
const applicationRoutes = require("./routes/applicationRoutes");//지원

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser()); // ✅ 추가 (쿠키 기반 조회수 기능 위해 필요)

// 이미 등록된 라우트
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dev", devRoutes);
app.use("/api/univcert", univCertRoutes);

// ✅ 새로 추가: /user
app.use("/api/user", userRoutes);

//recruitment, comment, like
app.use("/api", [
  recruitmentRoutes,
  commentRoutes,
  likeRoutes,
]);

app.use("/api/user", applicationRoutes);
app.use("/api/user", scrapRoutes);


// 기본 라우트
app.get("/", (req, res) => {
  res.status(200).send("Teamitaka Backend Running!");
});

module.exports = app;
