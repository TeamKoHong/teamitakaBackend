require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 📌 이메일 인증 API 라우트 추가
const univCertRoutes = require("./src/routes/univCertRoutes"); // 🚨 추가된 부분!
app.use("/api/univcert", univCertRoutes);

app.get("/", (req, res) => {
  res.send("Teamitaka Backend Running!");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
