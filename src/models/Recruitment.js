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
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
        onDelete: "CASCADE",
      },
      photo: {  // 새 필드
        type: DataTypes.STRING,
        allowNull: true,
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

    // ✅ 모집공고가 프로젝트와 1:1 관계를 가지도록 수정
    Recruitment.hasOne(models.Project, {
      foreignKey: "recruitment_id", // ✅ 수정: Projects 테이블에서 recruitment_id를 참조
      onDelete: "CASCADE", // 모집공고가 삭제되면 프로젝트도 삭제
    });
  };

  return Recruitment;
};
