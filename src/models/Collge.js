module.exports = (sequelize, DataTypes) => {
    const College = sequelize.define("College", {
      ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      CampusID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Campuses",
          key: "ID",
        },
      },
      Name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    });
  
    return College;
  };
  