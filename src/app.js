// src/app.js
const express = require("express");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const devRoutes = require("./routes/devRoutes");
const univCertRoutes = require("./routes/univCertRoutes");
const userRoutes = require("./routes/userRoutes"); // ← 새로 추가

const app = express();
app.use(express.json());

// 이미 등록된 라우트
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/dev", devRoutes);
app.use("/univcert", univCertRoutes);

// ✅ 새로 추가: /user
app.use("/user", userRoutes);

// 기본 라우트
app.get("/", (req, res) => {
  res.status(200).send("Teamitaka Backend Running!");
});

module.exports = app;
