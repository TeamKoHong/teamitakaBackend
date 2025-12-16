const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TeamiType = sequelize.define(
    "TeamiType",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      type_name: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: '티미 유형 이름 (예: 활동티미)',
      },
      description: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '유형 설명 (예: 활동적이고 긍정적인)',
      },
      attributes: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: '유형 속성 (예: {"긍정력":5,"에너지":5})',
      },
      compatible_types: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: '호환되는 티미 유형 배열',
      },
    },
    {
      tableName: "teami_types",
      timestamps: false,
    }
  );

  return TeamiType;
};
