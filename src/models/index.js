// src/models/index.js
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

// ✅ Admin 모델 추가
db.Admin = require("./Admin")(sequelize, Sequelize.DataTypes);

module.exports = db;
