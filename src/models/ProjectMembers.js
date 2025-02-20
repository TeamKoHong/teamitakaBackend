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
        onDelete: "CASCADE",
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
      role: {
        type: DataTypes.ENUM("팀장", "팀원"),
        defaultValue: "팀원",
        allowNull: false,
      },
      joined_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  ProjectMember.associate = (models) => {
    ProjectMember.belongsTo(models.Project, { foreignKey: "project_id" });
    ProjectMember.belongsTo(models.User, { foreignKey: "user_id" });
  };

  return ProjectMember;
};
