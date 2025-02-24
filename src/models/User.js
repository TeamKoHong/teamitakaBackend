const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      user_id: {
        type: DataTypes.UUID,
        autoIncrement: true, // ✅ 유일한 AUTO_INCREMENT 필드 유지
        primaryKey: true, // ✅ PRIMARY KEY 설정
      },
      uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4, // ✅ UUID 자동 생성
        unique: true, // ✅ Unique Key 유지
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
      profileImageUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      userType: {
        type: DataTypes.ENUM("ADMIN", "MEMBER"),
        defaultValue: "MEMBER",
      },
      role: {
        type: DataTypes.ENUM("ADMIN", "MEMBER"),
        defaultValue: "MEMBER",
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
