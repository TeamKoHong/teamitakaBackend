const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Review = sequelize.define(
    "Review",
    {
      review_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Projects",
          key: "project_id",
        },
        onDelete: "CASCADE",
      },
      reviewer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
        onDelete: "CASCADE",
      },
      reviewee_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
        onDelete: "CASCADE",
      },
      role_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ability: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      effort: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      commitment: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      communication: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      reflection: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      overall_rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "Reviews",
      freezeTableName: true,
      timestamps: true,
    }
  );

  // **프로젝트, 유저와의 관계 설정**
  Review.associate = (models) => {
    Review.belongsTo(models.Project, {
      foreignKey: "project_id",
      onDelete: "CASCADE",
    });

    Review.belongsTo(models.User, {
      as: "Reviewer",
      foreignKey: "reviewer_id",
      onDelete: "CASCADE",
    });

    Review.belongsTo(models.User, {
      as: "Reviewee",
      foreignKey: "reviewee_id",
      onDelete: "CASCADE",
    });
  };

  return Review;
};
