"use strict";

const { sequelize } = require("../config/db");
const Sequelize = require("sequelize");

const db = {};
db.Sequelize = Sequelize;

if (sequelize) {
  db.sequelize = sequelize;
  db.User = require("./User")(sequelize, Sequelize.DataTypes);
  db.Project = require("./Project")(sequelize, Sequelize.DataTypes);
  db.Review = require("./Review")(sequelize, Sequelize.DataTypes);
  db.Recruitment = require("./Recruitment")(sequelize, Sequelize.DataTypes);
  db.University = require("./University")(sequelize, Sequelize.DataTypes);
  db.College = require("./College")(sequelize, Sequelize.DataTypes);
  db.Department = require("./Department")(sequelize, Sequelize.DataTypes);
  db.VerifiedEmail = require("./VerifiedEmail")(sequelize, Sequelize.DataTypes);
  db.Admin = require("./Admin")(sequelize, Sequelize.DataTypes);

  Object.values(db).forEach((model) => {
    if (model && model.associate) {
      model.associate(db);
    }
  });
} else {
  console.log("🚨 Sequelize is not initialized. Skipping model setup.");
}

module.exports = db;
