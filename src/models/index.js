const { Sequelize } = require("sequelize");
const config = require("../config/config"); // DB 설정 파일 불러오기

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: false, // 로그 필요하면 true로 변경
});

// 모델 불러오기
const User = require("./User")(sequelize);
const Project = require("./Project")(sequelize);
const Review = require("./Review")(sequelize);
const Recruitment = require("./Recruitment")(sequelize);
const Notification = require("./Notification")(sequelize);
const Search = require("./Search")(sequelize);
const Keyword = require("./Keyword")(sequelize);

// 관계 설정
User.hasMany(Project, { foreignKey: "ownerId" });
User.hasMany(Review, { foreignKey: "reviewerId", as: "reviewsGiven" });
User.hasMany(Review, { foreignKey: "revieweeId", as: "reviewsReceived" });
User.hasMany(Notification, { foreignKey: "userId" });
User.hasMany(Search, { foreignKey: "userId" });

Project.belongsTo(User, { foreignKey: "ownerId" });
Project.hasMany(Review, { foreignKey: "projectId" });
Project.hasMany(Recruitment, { foreignKey: "projectId" });

Review.belongsTo(User, { foreignKey: "reviewerId", as: "reviewer" });
Review.belongsTo(User, { foreignKey: "revieweeId", as: "reviewee" });
Review.belongsTo(Project, { foreignKey: "projectId" });

Recruitment.belongsTo(Project, { foreignKey: "projectId" });

Notification.belongsTo(User, { foreignKey: "userId" });

Search.belongsTo(User, { foreignKey: "userId" });

module.exports = {
  sequelize,
  User,
  Project,
  Review,
  Recruitment,
  Notification,
  Search,
  Keyword,
};
