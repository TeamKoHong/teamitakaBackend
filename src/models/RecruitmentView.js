const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RecruitmentView = sequelize.define(
    "RecruitmentView",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      recruitment_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: "recruitment_views",
      timestamps: true, // 언제 봤는지 기록 (createdAt)
      indexes: [
        {
          unique: true, // ★ 중요: 한 유저는 한 글에 대해 하나의 기록만 가짐
          fields: ["user_id", "recruitment_id"],
        },
      ],
    }
  );

  return RecruitmentView;
};