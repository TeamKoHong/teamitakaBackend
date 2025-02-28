// ProjectMembers.js
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
      status: {
        type: DataTypes.ENUM("활성", "비활성"),
        defaultValue: "활성",
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: true,
    }
  );


  return ProjectMember;
};