const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Comment = sequelize.define("Comment", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",  // 유저 테이블 참조
        key: "user_id",
      },
      onDelete: "CASCADE",
    },
    recruitment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Recruitments",  // 모집공고 테이블 참조
        key: "recruitment_id",
      },
      onDelete: "CASCADE",
    },
  }, {
    tableName: "comments",
    freezeTableName: true,
    timestamps: true,
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.User, { foreignKey: 'user_id', targetKey: 'user_id' });
    Comment.belongsTo(models.Recruitment, { foreignKey: 'recruitment_id', targetKey: 'recruitment_id' });
  };
  
  return Comment;
};
