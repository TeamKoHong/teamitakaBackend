const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const FeedbackItem = sequelize.define(
    "FeedbackItem",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      text: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '피드백 항목 텍스트',
      },
      type: {
        type: DataTypes.STRING(10),
        allowNull: false,
        comment: 'positive or negative',
      },
    },
    {
      tableName: "feedback_items",
      timestamps: false,
    }
  );

  return FeedbackItem;
};
