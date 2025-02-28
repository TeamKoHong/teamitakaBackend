const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      user_id: {
        type: DataTypes.CHAR(36).BINARY,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      username: { 
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      userType: {
        type: DataTypes.ENUM("ADMIN", "MEMBER"),
        defaultValue: "MEMBER",
      },
      role: {
        type: DataTypes.ENUM("ADMIN", "MEMBER"),
        defaultValue: "MEMBER",
      },
      university: { // 대학 정보 추가
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      major: { // 전공 정보 추가
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      avatar: { // 프로필 사진 (URL)
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bio: { // 자기소개
        type: DataTypes.TEXT,
        allowNull: true,
      },
      awards: { // 수상이력
        type: DataTypes.TEXT,
        allowNull: true,
      },
      skills: { // 보유 스킬 (예: "JavaScript, Python, React")
        type: DataTypes.TEXT,
        allowNull: true,
      },
      portfolio_url: { // 포트폴리오 링크
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "Users",
      timestamps: true,
    }
  );

  return User;
};
