const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Schedule = sequelize.define(
    "Schedule",
    {
      schedule_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "projects", // ✅ 수정됨: 실제 DB 테이블명은 보통 소문자 복수형입니다.
          key: "project_id",
        },
        onDelete: "CASCADE",
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "user_id",
        },
      },
    },
    {
      tableName: "schedules",
      freezeTableName: true,
      timestamps: true,
      underscored: true, // ✅ 추가 추천: created_at, updated_at 등 컬럼명을 스네이크 케이스로 통일
    }
  );

  return Schedule;
};