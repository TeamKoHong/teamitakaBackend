const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Project = sequelize.define(
    "Projects", // 모델명 변경
    {
      project_id: {
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
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
        onDelete: "CASCADE",
      },
      recruitment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: "Recruitments",
          key: "recruitment_id",
        },
        onDelete: "CASCADE",
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("예정", "진행 중", "완료"),
        defaultValue: "예정",
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "Projects", // 명시적 테이블 이름
      freezeTableName: true,
      timestamps: true,
    }
  );

  Project.associate = (models) => {
    Project.belongsTo(models.Recruitment, {
      foreignKey: "recruitment_id",
      onDelete: "CASCADE",
    });
    Project.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
  };

  return Project;
};