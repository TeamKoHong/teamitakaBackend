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
        allowNull: true, // 모의 데이터에 없으므로 임시로 허용

      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "Default Description",
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
        allowNull: false,
        unique: true,
        references: {
          model: "Recruitments",
          key: "recruitment_id",
        },
        onDelete: "CASCADE",
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("예정", "진행 중", "완료"),
        defaultValue: "예정",
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: true,
      },

    },
    {
      tableName: "Projects",
      freezeTableName: true,
      timestamps: true,
    }
  );

  Project.beforeCreate((project, options) => {
    if (!project.user_id) throw new Error("User ID is required");
    if (!project.recruitment_id) throw new Error("Recruitment ID is required");
  });

  return Project;
};