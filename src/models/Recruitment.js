const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Recruitment = sequelize.define("Recruitment", {
    id: {
      type: DataTypes.UUID,
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
    status: {
      type: DataTypes.ENUM("OPEN", "CLOSED"),
      defaultValue: "OPEN",
    },
  });

  return Recruitment;
};
