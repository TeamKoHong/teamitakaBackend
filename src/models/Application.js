module.exports = (sequelize, DataTypes) => {
    const Application = sequelize.define("Application", {
      application_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      status: {
        type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
        defaultValue: "PENDING",
      },
    });
  
    Application.associate = (models) => {
      Application.belongsTo(models.User, { foreignKey: "user_id", onDelete: "CASCADE" });
      Application.belongsTo(models.Recruitment, { foreignKey: "recruitment_id", onDelete: "CASCADE" });
    };
  
    return Application;
  };
  