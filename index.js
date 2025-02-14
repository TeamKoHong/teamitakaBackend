require("dotenv").config();
const app = require("./app"); // 기존 Express 설정을 app.js에서 가져옴

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
