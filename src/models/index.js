"use strict";

const { sequelize } = require("../config/db");
const Sequelize = require("sequelize");

const db = {};
db.Sequelize = Sequelize;

// ✅ Sequelize 객체가 정상적으로 생성된 경우만 모델 초기화
if (sequelize) {
  db.sequelize = sequelize;
  db.Keyword = require("./Keyword")(sequelize, Sequelize.DataTypes);
  db.Notification = require("./Notification")(sequelize, Sequelize.DataTypes);
  db.Project = require("./Project")(sequelize, Sequelize.DataTypes);
  db.Recruitment = require("./Recruitment")(sequelize, Sequelize.DataTypes);
  db.Review = require("./Review")(sequelize, Sequelize.DataTypes);
  db.Search = require("./Search")(sequelize, Sequelize.DataTypes);
  db.User = require("./User")(sequelize, Sequelize.DataTypes);
  db.VerifiedEmail = require("./VerifiedEmail")(sequelize, Sequelize.DataTypes);
  db.Admin = require("./Admin")(sequelize, Sequelize.DataTypes);
  db.University = require("./University")(sequelize, Sequelize.DataTypes);
  db.College = require("./College")(sequelize, Sequelize.DataTypes);
  db.Department = require("./Department")(sequelize, Sequelize.DataTypes);

  // 모델 간 연관 설정
  Object.values(db).forEach((model) => {
    if (model && model.associate) {
      model.associate(db);
    }
  });
} else {
  console.log("🚨 Sequelize 인스턴스가 생성되지 않음. DB 모델 초기화를 건너뜁니다.");
}

module.exports = db;
