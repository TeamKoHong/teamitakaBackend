const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const devRoutes = require("./routes/devRoutes");
const univCertRoutes = require("./routes/univCertRoutes");
const userRoutes = require("./routes/userRoutes");
const recruitmentRoutes = require("./routes/recruitmentRoutes"); // ← ✅ 추가된 부분
const commentRoutes = require("./routes/commentRoutes");
const projectRoutes = require("./routes/projectRoutes"); // ✅ 프로젝트 라우트 추가
const searchRoutes = require("./routes/searchRoutes");
//const profileRoutes = require("./routes/profileRoutes");//프로필
const reviewRoutes = require("./routes/reviewRoutes"); // ✅ 리뷰 라우트 추가
const draftRoutes = require("./routes/draftRoutes");  // draftRoutes 추가
const scrapRoutes = require("./routes/scrapRoutes");  // scrapRoutes 추가
const applicationRoutes = require("./routes/applicationRoutes"); 

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// 이미 등록된 라우트
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dev", devRoutes);
app.use("/api/univcert", univCertRoutes);

// ✅ 새로 추가: /user
app.use("/api/user", userRoutes);

app.use("/api/recruitment", recruitmentRoutes); // ✅ 개별 등록 방식
app.use("/api/comment", commentRoutes);
app.use("/api/project", projectRoutes);       // ✅ 프로젝트 라우트 추가
app.use("/api/search", searchRoutes);
//app.use("/api/profiles", profileRoutes);
app.use("/api/reviews", reviewRoutes); // ✅ 리뷰 라우트 추가
app.use("/api/drafts", draftRoutes);    // draftRoutes 라우트 추가
app.use("/api/scraps", scrapRoutes); 
app.use("/api/applications", applicationRoutes); 

// 기본 라우트
app.get("/", (req, res) => {
  res.status(200).send("Teamitaka Backend Running!");
});

module.exports = app;
