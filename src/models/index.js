"use strict";

const { sequelize } = require("../config/db");
const Sequelize = require("sequelize");

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// 모델 추가
db.User = require("./User")(sequelize, Sequelize.DataTypes);
db.Profile = require("./Profile")(sequelize, Sequelize.DataTypes); // 추가
db.Project = require("./Project")(sequelize, Sequelize.DataTypes);
db.Recruitment = require("./Recruitment")(sequelize, Sequelize.DataTypes);
db.Review = require("./Review")(sequelize, Sequelize.DataTypes);
db.Search = require("./Search")(sequelize, Sequelize.DataTypes);
db.VerifiedEmail = require("./VerifiedEmail")(sequelize, Sequelize.DataTypes);
db.Admin = require("./Admin")(sequelize, Sequelize.DataTypes);
db.University = require("./University")(sequelize, Sequelize.DataTypes);
db.College = require("./College")(sequelize, Sequelize.DataTypes);
db.Department = require("./Department")(sequelize, Sequelize.DataTypes);
db.Application = require("./Application")(sequelize, Sequelize.DataTypes);
db.Hashtag = require("./Hashtag")(sequelize, Sequelize.DataTypes);
db.Todo = require("./Todo")(sequelize, Sequelize.DataTypes);
db.Timeline = require("./Timeline")(sequelize, Sequelize.DataTypes);

// 모델 간 관계 설정
Object.values(db).forEach((model) => {
  if (model && model.associate) {
    console.log(`Associating model: ${model.name}`);
    model.associate(db);
  }
});

module.exports = db;