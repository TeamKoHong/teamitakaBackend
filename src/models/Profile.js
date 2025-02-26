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

    // ✅ Projects 테이블과 Users 테이블 직접 연결 (Profiles를 거치지 않음)
    models.Project.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });

    // ✅ Profile과 Projects를 1:N으로 조회 가능하도록 설정 (하지만 FK는 Users.user_id를 사용)
    Profile.hasMany(models.Project, {
      foreignKey: "user_id", // ✅ Projects.user_id는 Users.user_id를 참조해야 함
      sourceKey: "user_id",
    });
  };

  return Profile;
};
