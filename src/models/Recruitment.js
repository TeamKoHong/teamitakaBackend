const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Recruitment = sequelize.define(
    "Recruitment",
    {
      recruitment_id: {
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
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
        onDelete: "CASCADE",
      },
      reference_id: {
        type: DataTypes.UUID,
        allowNull: true, // 새 프로젝트로 연결할 경우 사용
        references: {
          model: "Projects",
          key: "project_id",
        },
        onDelete: "SET NULL",
      },
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 추가
    }
  );

  Recruitment.associate = (models) => {
    Recruitment.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });

    Recruitment.hasOne(models.Project, {
      foreignKey: "reference_id",
      onDelete: "SET NULL",
    });
  };

  return Recruitment;
};
