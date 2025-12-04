const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Scrap = sequelize.define("Scrap", {
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
    recruitment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
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
