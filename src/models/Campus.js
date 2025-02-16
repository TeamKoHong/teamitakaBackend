module.exports = (sequelize, DataTypes) => {
    const Campus = sequelize.define("Campus", {
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
      },
      Name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    });
  
    Campus.associate = (models) => {
      Campus.belongsTo(models.University, {
        foreignKey: "UniversityID",
        onDelete: "CASCADE",
      });
  
      Campus.hasMany(models.College, {
        foreignKey: "CampusID",
        onDelete: "CASCADE",
      });
    };
  
    return Campus;
  };
  