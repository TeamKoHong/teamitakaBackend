const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Recruitment = sequelize.define(
    "Recruitment",
    {
      recruitment_id: {
        type: DataTypes.CHAR(36).BINARY,
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
        type: DataTypes.CHAR(36).BINARY,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
        onDelete: "CASCADE",
      },
      photo: {
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
      timestamps: true,
    }
  );

  Recruitment.associate = (models) => {
    Recruitment.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
    Recruitment.hasOne(models.Project, {
      foreignKey: "recruitment_id",
      onDelete: "CASCADE",
    });
  };

  return Recruitment;
};