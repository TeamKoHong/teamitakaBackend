const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Project = sequelize.define(
    "Project",
    {
      project_id: {
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
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
        onDelete: "CASCADE",
      },
      recruitment_id: {
        type: DataTypes.UUID,
        allowNull: false, // ✅ 프로젝트는 반드시 모집공고를 가져야 함
        unique: true,     // ✅ 모집공고와 1:1 관계 유지
        references: {
          model: "Recruitments",
          key: "recruitment_id",
        },
        onDelete: "CASCADE",
      },
      start_date: { // ✅ 시작일 추가
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_date: { // ✅ 종료일 추가
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: { // ✅ 상태 관리
        type: DataTypes.ENUM("예정", "진행 중", "완료"),
        defaultValue: "예정",
        allowNull: false,
      },
      role: { // ✅ 역할 필드
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      freezeTableName: true,
      timestamps: true, // createdAt, updatedAt 자동 추가
    }
  );

  // ✅ 연관관계 정의
  Project.associate = (models) => {
    // 모집공고와 1:1 관계
    Project.belongsTo(models.Recruitment, {
      foreignKey: "recruitment_id",
      onDelete: "CASCADE",
    });

    // 사용자와 N:1 관계
    Project.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });

    // ✅ 팀원 (N:M)
    Project.belongsToMany(models.User, {
      through: models.ProjectMember,
      foreignKey: "project_id",
      otherKey: "user_id",
    });

    // ✅ 할 일 (1:N)
    Project.hasMany(models.Todo, {
      foreignKey: "project_id",
      onDelete: "CASCADE",
    });

    // ✅ 타임라인 (1:N)
    Project.hasMany(models.Timeline, {
      foreignKey: "project_id",
      onDelete: "CASCADE",
    });
  };

  return Project;
};
