const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const UserFeedback = sequelize.define(
    "UserFeedback",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        comment: '피드백 대상 사용자',
      },
      feedback_item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'feedback_items',
          key: 'id',
        },
        comment: '피드백 항목 ID',
      },
      count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '받은 횟수',
      },
    },
    {
      tableName: "user_feedback",
      timestamps: true,
      createdAt: process.env.NODE_ENV === 'production' ? 'created_at' : 'createdAt',
      updatedAt: process.env.NODE_ENV === 'production' ? 'updated_at' : 'updatedAt',
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'feedback_item_id'],
        },
      ],
    }
  );

  return UserFeedback;
};
