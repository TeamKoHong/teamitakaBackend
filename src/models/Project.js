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
        defaultValue: "Default Project",
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

  Project.associate = (models) => {
    Project.belongsTo(models.Recruitment, {
      foreignKey: "recruitment_id",
      onDelete: "CASCADE",
    });
    Project.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
    Project.belongsToMany(models.User, {
      through: "ProjectMember",
      foreignKey: "project_id",
      otherKey: "user_id",
    });
    Project.hasMany(models.Todo, {
      foreignKey: "project_id",
      onDelete: "CASCADE",
    });
    Project.hasMany(models.Timeline, {
      foreignKey: "project_id",
      onDelete: "CASCADE",
    });
  };

  return Project;
};