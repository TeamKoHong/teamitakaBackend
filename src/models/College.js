module.exports = (sequelize, DataTypes) => {
  const College = sequelize.define("College", {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    UniversityID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Universities",
        key: "ID",
      },
      field: "university_id",  // 데이터베이스 컬럼 이름과 매핑
    },
    Name: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
  }, {
    tableName: "Colleges",
    timestamps: true,
  });

  return College;
};