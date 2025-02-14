// src/models/index.js
"use strict";

const { sequelize } = require("../config/db"); 
const Sequelize = require("sequelize");

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 여기서 모델들을 로드/정의
// 예) db.User = require("./User")(sequelize);
db.Keyword = require("./User")(sequelize);
db.Notification = require("./Notification")(sequelize);
db.Project = require("./Project")(sequelize);
db.Recruitment = require("./Recruitment")(sequelize);
db.Review = require("./Review")(sequelize);
db.Search = require("./Search")(sequelize);
db.User = require("./User")(sequelize);
db.VerifiedEmail = require("./VerifiedEmail")(sequelize);

module.exports = db;
