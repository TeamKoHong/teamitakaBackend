const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProjectMember = sequelize.define(
    "ProjectMember",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Projects",
          key: "project_id",
        },
        onDelete: "CASCADE", // 프로젝트 삭제 시 팀원도 삭제
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
        onDelete: "CASCADE", // 사용자 삭제 시 팀원 정보 삭제
      },
      role: {
        type: DataTypes.ENUM("팀장", "팀원"),
        defaultValue: "팀원",
        allowNull: false,
      },
      joined_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      // ✅ 추가: 팀원 상태 관리 (선택사항)
      status: {
        type: DataTypes.ENUM("활성", "비활성"),
        defaultValue: "활성",
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: true, // createdAt, updatedAt 자동 생성
    }
  );

  // ✅ 연관관계 정의
  ProjectMember.associate = (models) => {
    ProjectMember.belongsTo(models.Project, { 
      foreignKey: "project_id", 
      onDelete: "CASCADE" 
    });
    ProjectMember.belongsTo(models.User, { 
      foreignKey: "user_id", 
      onDelete: "CASCADE" 
    });
  };

  return ProjectMember;
};
