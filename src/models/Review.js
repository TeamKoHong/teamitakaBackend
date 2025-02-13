const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Review = sequelize.define("Review", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });

  return Review;
};
