//keword->Hashtag
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Keyword = sequelize.define("Keyword", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    keyword: {
      type: DataTypes.STRING,
      unique: true,
    },
    count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: "keywords",
    freezeTableName: true,
    timestamps: false,
  });

  return Keyword;
};
