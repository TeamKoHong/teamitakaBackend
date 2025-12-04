const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Scrap = sequelize.define("Scrap", {
    scrap_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "users",
        key: "user_id",
      },
      onDelete: "CASCADE",
    },
    project_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "projects",
        key: "project_id",
      },
      onDelete: "CASCADE",
    },
    recruitment_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "recruitments",
        key: "recruitment_id",
      },
      onDelete: "CASCADE",
    },
  }, {
    tableName: "scraps",
    freezeTableName: true,
    timestamps: true,
    underscored: true,
  });

  return Scrap;
};
