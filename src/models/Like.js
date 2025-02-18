const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Like = sequelize.define("Like", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",  // 유저 테이블 참조
        key: "id",
      },
      onDelete: "CASCADE",
    },
    recruitment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Recruitments",  // 모집공고 테이블 참조
        key: "id",
      },
      onDelete: "CASCADE",
    },
  });

  Like.associate = (models) => {
    Like.belongsTo(models.User, { foreignKey: "user_id" });
    Like.belongsTo(models.Recruitment, { foreignKey: "recruitment_id" });
  };

  return Like;
};
