require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 📌 관리자 API 라우트 추가
const adminRoutes = require("./src/routes/adminRoutes");
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Teamitaka Backend Running!");
});

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
