const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Project = sequelize.define(
    "Project",
    {
      project_id: {
        type: DataTypes.CHAR(36).BINARY,
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
        type: DataTypes.CHAR(36).BINARY,
        allowNull: false,
        references: {
          model: "User",
          key: "user_id",
        },
        onDelete: "CASCADE",
      },
      recruitment_id: {
        type: DataTypes.CHAR(36).BINARY,
        allowNull: false,
        unique: true,
        references: {
          model: "Recruitment",
          key: "recruitment_id",
        },
        onDelete: "CASCADE",
      },
      role: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "Projects",
      freezeTableName: true,
      timestamps: true,
    }
  );

  Project.associate = (models) => {
    Project.belongsTo(models.Recruitment, {
      foreignKey: "recruitment_id",
      onDelete: "CASCADE",
    });
    Project.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
  };

  return Project;
};