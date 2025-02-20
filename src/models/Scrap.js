const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Scrap = sequelize.define("Scrap", {
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

  Scrap.associate = (models) => {
    Scrap.belongsTo(models.User, { foreignKey: "user_id" });
    Scrap.belongsTo(models.Recruitment, { foreignKey: "recruitment_id" });
  };

  return Scrap;
};
