const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Review = sequelize.define("Review", {
    review_id: {
      type: DataTypes.CHAR(36).BINARY,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    project_id: {
      type: DataTypes.CHAR(36).BINARY,
      allowNull: false,
    },
    reviewer_id: {
      type: DataTypes.CHAR(36).BINARY,
      allowNull: false,
    },
    reviewee_id: {
      type: DataTypes.CHAR(36).BINARY,
      allowNull: false,
    },
    multiple_choice: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    subjective: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    advice: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    secret: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    feedback: {
      type: DataTypes.TEXT,
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
  });

  return Review;
};