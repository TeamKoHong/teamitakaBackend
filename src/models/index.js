"use strict";

const { sequelize } = require("../config/db");
const Sequelize = require("sequelize");

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 기존 모델 로드
db.Keyword = require("./Keyword")(sequelize, Sequelize.DataTypes);
db.Notification = require("./Notification")(sequelize, Sequelize.DataTypes);
db.Project = require("./Project")(sequelize, Sequelize.DataTypes);
db.Recruitment = require("./Recruitment")(sequelize, Sequelize.DataTypes);
db.Review = require("./Review")(sequelize, Sequelize.DataTypes);
db.Search = require("./Search")(sequelize, Sequelize.DataTypes);
db.User = require("./User")(sequelize, Sequelize.DataTypes);
db.VerifiedEmail = require("./VerifiedEmail")(sequelize, Sequelize.DataTypes);
db.Admin = require("./Admin")(sequelize, Sequelize.DataTypes);

// 주의: 여기서 불러오는 파일 이름과 실제 파일명을 일치시켜야 함
db.University = require("./University")(sequelize, Sequelize.DataTypes);
db.College = require("./College")(sequelize, Sequelize.DataTypes);  // <-- 실제 파일이 College.js인지 확인
db.Department = require("./Department")(sequelize, Sequelize.DataTypes);

// associate 호출도 가능 (예: db.College.associate(db))
Object.values(db).forEach(model => {
  if (model.associate) {
    model.associate(db);
  }
});

module.exports = db;
