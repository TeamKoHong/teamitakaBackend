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
    });
  
    Department.associate = (models) => {
      Department.belongsTo(models.College, {
        foreignKey: "CollegeID",
        onDelete: "CASCADE",
      });
    };
  
    return Department;
  };
  