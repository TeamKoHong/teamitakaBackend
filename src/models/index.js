"use strict";

const { sequelize } = require("../config/db");
const Sequelize = require("sequelize");

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// ✅ 모델 불러오기
db.Admin = require("./Admin")(sequelize, Sequelize.DataTypes);
db.Application = require("./Application")(sequelize, Sequelize.DataTypes);
db.College = require("./College")(sequelize, Sequelize.DataTypes);
db.Comment = require("./Comment")(sequelize, Sequelize.DataTypes);
db.Department = require("./Department")(sequelize, Sequelize.DataTypes);
db.Hashtag = require("./Hashtag")(sequelize, Sequelize.DataTypes);
db.Keyword = require("./Keyword")(sequelize, Sequelize.DataTypes);
db.Like = require("./Like")(sequelize, Sequelize.DataTypes);
db.Notification = require("./Notification")(sequelize, Sequelize.DataTypes);
db.Project = require("./Project")(sequelize, Sequelize.DataTypes);
db.ProjectMembers = require("./ProjectMembers")(sequelize, Sequelize.DataTypes);
db.ProjectPost = require("./ProjectPost")(sequelize, Sequelize.DataTypes);
db.Recruitment = require("./Recruitment")(sequelize, Sequelize.DataTypes);
db.Review = require("./Review")(sequelize, Sequelize.DataTypes);
db.Schedule = require("./Schedule")(sequelize, Sequelize.DataTypes);
db.Scrap = require("./Scrap")(sequelize, Sequelize.DataTypes);
db.Search = require("./Search")(sequelize, Sequelize.DataTypes);
db.Timeline = require("./Timeline")(sequelize, Sequelize.DataTypes);
db.Todo = require("./Todo")(sequelize, Sequelize.DataTypes);
db.University = require("./University")(sequelize, Sequelize.DataTypes);
db.User = require("./User")(sequelize, Sequelize.DataTypes);
db.VerifiedEmail = require("./VerifiedEmail")(sequelize, Sequelize.DataTypes);
db.Vote = require("./Vote")(sequelize, Sequelize.DataTypes);
db.VoteOption = require("./VoteOption")(sequelize, Sequelize.DataTypes);
db.VoteResponse = require("./VoteResponse")(sequelize, Sequelize.DataTypes);

// 모델 간 관계 설정
db.Application.associate = (models) => {
  db.Application.belongsTo(models.User, { foreignKey: "user_id", onDelete: "CASCADE" });
  db.Application.belongsTo(models.Recruitment, { foreignKey: "recruitment_id", onDelete: "CASCADE" });
};

db.College.associate = (models) => {
  db.College.belongsTo(models.University, {
    foreignKey: "UniversityID",
    onDelete: "CASCADE",
  });
  db.College.hasMany(models.Department, {
    foreignKey: "CollegeID",
    onDelete: "CASCADE",
  });
};

db.Comment.associate = (models) => {
  db.Comment.belongsTo(models.User, { foreignKey: "user_id" });
  db.Comment.belongsTo(models.Recruitment, { foreignKey: "recruitment_id" });
};

db.Department.associate = (models) => {
  db.Department.belongsTo(models.College, {
    foreignKey: "CollegeID",
    onDelete: "CASCADE",
  });
};

db.Hashtag.associate = (models) => {
  db.Hashtag.belongsToMany(models.Recruitment, {
    through: "recruitment_hashtags",
    foreignKey: "hashtag_id",
  });
};

db.Like.associate = (models) => {
  db.Like.belongsTo(models.User, { foreignKey: "user_id" });
  db.Like.belongsTo(models.Recruitment, { foreignKey: "recruitment_id" });
};

db.Project.beforeCreate((project, options) => {
  if (!project.user_id) throw new Error("User ID is required");
  if (!project.recruitment_id) throw new Error("Recruitment ID is required");
});

db.Project.associate = (models) => {
  db.Project.belongsTo(models.Recruitment, {
    foreignKey: "recruitment_id",
    onDelete: "CASCADE",
  });
  db.Project.belongsTo(models.User, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
  });
  db.Project.belongsToMany(models.User, {
    through: "ProjectMember",
    foreignKey: "project_id",
    otherKey: "user_id",
  });
  db.Project.hasMany(models.Todo, {
    foreignKey: "project_id",
    onDelete: "CASCADE",
  });
  db.Project.hasMany(models.Timeline, {
    foreignKey: "project_id",
    onDelete: "CASCADE",
  });
  db.Project.hasMany(db.ProjectPost, { 
    foreignKey: "project_id", 
    onDelete: "CASCADE" });
};

db.ProjectMembers.associate = (models) => {
  db.ProjectMembers.belongsTo(models.Project, {
    foreignKey: "project_id",
    onDelete: "CASCADE",
  });
  db.ProjectMembers.belongsTo(models.User, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
  });
};

db.ProjectPost.belongsTo(db.Project, { foreignKey: "project_id" });
db.ProjectPost.belongsTo(db.User, { foreignKey: "user_id" });

db.Recruitment.associate = (models) => {
  db.Recruitment.belongsTo(models.User, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
  });
  db.Recruitment.hasOne(models.Project, {
    foreignKey: "recruitment_id",
    onDelete: "CASCADE",
  });
  db.Recruitment.hasMany(db.Application, { 
    foreignKey: "recruitment_id", 
    onDelete: "CASCADE" });
};

db.Review.associate = (models) => {
  db.Review.belongsTo(models.Project, {
    foreignKey: "project_id",
    onDelete: "CASCADE",
  });
  db.Review.belongsTo(models.User, {
    as: "Reviewer",
    foreignKey: "reviewer_id",
    onDelete: "CASCADE",
  });
  db.Review.belongsTo(models.User, {
    as: "Reviewee",
    foreignKey: "reviewee_id",
    onDelete: "CASCADE",
  });
};

db.Scrap.associate = (models) => {
  db.Scrap.belongsTo(models.User, { foreignKey: "user_id" });
  db.Scrap.belongsTo(models.Recruitment, { foreignKey: "recruitment_id" });
};

db.Todo.associate = (models) => {
  db.Todo.belongsTo(models.Project, {
    foreignKey: "project_id",
    onDelete: "CASCADE",
  });
};

db.University.associate = (models) => {
  db.University.hasMany(models.College, {
    foreignKey: "UniversityID",
    onDelete: "CASCADE",
  });
};

db.Vote.associate = (models) => {
  db.Vote.belongsTo(models.Project, {
    foreignKey: "project_id",
    onDelete: "CASCADE",
  });
  db.Vote.hasMany(models.VoteOption, {
    foreignKey: "vote_id",
    onDelete: "CASCADE",
  });
  db.Vote.hasMany(models.VoteResponse, {
    foreignKey: "vote_id",
    onDelete: "CASCADE",
  });
};

db.VoteOption.associate = (models) => {
  db.VoteOption.belongsTo(models.Vote, {
    foreignKey: "vote_id",
    onDelete: "CASCADE",
  });
  db.VoteOption.hasMany(models.VoteResponse, {
    foreignKey: "option_id",
    onDelete: "CASCADE",
  });
};

db.VoteResponse.associate = (models) => {
  db.VoteResponse.belongsTo(models.Vote, {
    foreignKey: "vote_id",
    onDelete: "CASCADE",
  });
  db.VoteResponse.belongsTo(models.VoteOption, {
    foreignKey: "option_id",
    onDelete: "CASCADE",
  });
  db.VoteResponse.belongsTo(models.User, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
  });
};

db.Schedule.associate = (models) => {
  db.Schedule.belongsTo(models.Project, {
    foreignKey: "project_id",
    onDelete: "CASCADE",
  });
};

// 모델 간 관계 설정 실행
Object.values(db).forEach((model) => {
  if (model && model.associate) {
    console.log(`Associating model: ${model.name}`);
    model.associate(db);
  }
});

module.exports = db;