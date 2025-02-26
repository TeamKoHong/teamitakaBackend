const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Search = sequelize.define("Search", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    keyword: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    searchTime: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  return Search;
};