const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Profile = sequelize.define(
    "Profile",
    {
      profile_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.CHAR(36).BINARY,
        allowNull: false,
        references: {
          model: "Users", // ✅ 정확한 테이블명으로 설정
          key: "user_id",
        },
        onDelete: "CASCADE",
      },
      nickname: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      profileImageUrl: {
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
      tableName: "Profiles",
      freezeTableName: true,
      timestamps: true,
    }
  );

  Profile.associate = (models) => {
    // ✅ Profiles 테이블과 Users 테이블 연결
    Profile.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });

    // ✅ Profiles 테이블과 Projects 테이블 연결 (1:N 관계)
    Profile.hasMany(models.Project, {
      foreignKey: "user_id", // ✅ 한 명의 사용자가 여러 개의 프로젝트를 가질 수 있음
      onDelete: "CASCADE",
    });
  };

  return Profile;
};
