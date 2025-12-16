const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const UserTeamiType = sequelize.define(
    "UserTeamiType",
    {
      user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'user_id',
        },
        comment: '사용자 ID',
      },
      teami_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'teami_types',
          key: 'id',
        },
        comment: '티미 유형 ID',
      },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        comment: '유형 할당 시각',
      },
    },
    {
      tableName: "user_teami_type",
      timestamps: false,
    }
  );

  return UserTeamiType;
};
