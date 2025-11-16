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
        defaultValue: "Untitled Recruitment",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "No description provided",
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
      project_id: {
        type: DataTypes.UUID,
        allowNull: true,  // 모집공고가 프로젝트 없이도 존재 가능
        references: {
          model: "Projects",
          key: "project_id",
        },
        onDelete: "CASCADE",
      },
      views: { // 추가
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      max_applicants: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 10,
        comment: "최대 지원자 수",
      },
      recruitment_start: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "모집 시작일",
      },
      recruitment_end: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "모집 마감일",
      },
      project_type: {
        type: DataTypes.ENUM("course", "side"),
        allowNull: true,
        comment: "프로젝트 타입 (수업/사이드)",
      },
      photo_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "모집공고 대표 이미지 URL",
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "recruitments",
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Recruitment;
};