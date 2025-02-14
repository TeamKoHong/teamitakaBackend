// src/app.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const devRoutes = require("./routes/devRoutes");
const univCertRoutes = require("./routes/univCertRoutes");
const userRoutes = require("./routes/userRoutes"); // ← 새로 추가

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

// 기본 라우트
app.get("/", (req, res) => {
  res.status(200).send("Teamitaka Backend Running!");
});

module.exports = app;
