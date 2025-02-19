const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Recruitment = sequelize.define(
    "Recruitment",
    {
      recruitment_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("OPEN", "CLOSED"),
        defaultValue: "OPEN",
      },
      required_members: { // 필요 지원 인원
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 추가
    }
  );

  Recruitment.associate = (models) => {
    Recruitment.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
  Recruitment.associate = (models) => {
    Recruitment.hasMany(models.Application, { foreignKey: "recruitment_id", onDelete: "CASCADE" });
  };

    // ✅ 모집공고가 프로젝트와 1:1 관계를 가지도록 설정
    Recruitment.hasOne(models.Project, {
      foreignKey: "recruitment_id",
      onDelete: "CASCADE",
    });

    // ✅ 모집공고와 해시태그를 다대다 관계로 설정
    Recruitment.belongsToMany(models.Hashtag, {
      through: models.RecruitmentHashtag || "recruitment_hashtags",
      foreignKey: "recruitment_id",
      otherKey: "hashtag_id",
      onDelete: "CASCADE",
    });
  };

  return Recruitment;
};
