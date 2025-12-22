module.exports = (sequelize, DataTypes) => {
    const Department = sequelize.define("Department", {
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      CollegeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Colleges",
          key: "ID",
        },
      },
      Name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    }, {
      tableName: "departments",
      freezeTableName: true,
      timestamps: false,
    });

    return Department;
  };
  