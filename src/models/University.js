module.exports = (sequelize, DataTypes) => {
    const University = sequelize.define("University", {
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      Name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      Country: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    }, {
      tableName: "universities",
      freezeTableName: true,
      timestamps: false,
    });

    return University;
  };
  