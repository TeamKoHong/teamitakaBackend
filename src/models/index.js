"use strict";

const { sequelize } = require("../config/db");
const Sequelize = require("sequelize");

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

try {
  // ✅ 모델 불러오기
  db.User = require("./User")(sequelize, Sequelize.DataTypes);
  db.Profile = require("./Profile")(sequelize, Sequelize.DataTypes);
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
  db.Keyword = require("./Keyword")(sequelize, Sequelize.DataTypes);         // ✅ 추가
  db.Notification = require("./Notification")(sequelize, Sequelize.DataTypes); // ✅ 추가
  db.Comment = require("./Comment")(sequelize, Sequelize.DataTypes);         // ✅ 추가
  db.Scrap = require("./Scrap")(sequelize, Sequelize.DataTypes);             // ✅ 추가
  db.ProjectMembers = require("./ProjectMembers")(sequelize, Sequelize.DataTypes); // ✅ 추가

  // ✅ 디버깅: undefined 모델 찾기
  Object.keys(db)
    .filter((key) => !["Sequelize", "sequelize"].includes(key))
    .forEach((modelName) => {
      const model = db[modelName];
      if (model && model.associate) {
        console.log(`Associating model: ${model.name}`);
        model.associate(db);
      } else if (!model) {
        console.error(`❌ Model "${modelName}" is undefined.`);
      } else {
        console.log(`No associate method for model: ${modelName}`);
      }
    });
} catch (error) {
  console.error("❌ Error in models/index.js:", error);
}

module.exports = db;
