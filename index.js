require("dotenv").config();
const app = require("./src/app"); // src 폴더에 존재하는 경우 경로 수정

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
