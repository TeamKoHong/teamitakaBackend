const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Scrap = sequelize.define("Scrap", {
    id: {
      type: DataTypes.CHAR(36).BINARY,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    recruitment_id: {
      type: DataTypes.CHAR(36).BINARY,
      allowNull: false,
      references: {
        model: "Recruitments",
        key: "recruitment_id",
      },
      onDelete: "CASCADE",
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
  });


  return Scrap;
};
