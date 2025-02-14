// index.js
const app = require("./src/app");  // Express 앱
// 여기서 db.js가 필요하다면 import (단, 일반적으로 db.js는 다른 곳에서 import되며,
// NODE_ENV !== 'test' 조건 하에 connectDB()가 이미 실행될 것)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
