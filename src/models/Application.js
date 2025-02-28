module.exports = (sequelize, DataTypes) => {
    const Application = sequelize.define("Application", {
      application_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: { // ✅ 추가
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
        onDelete: "CASCADE",
      },
      recruitment_id: { // ✅ 추가
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Recruitments",
          key: "recruitment_id",
        },
        onDelete: "CASCADE",
      },
      status: {
        type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
        defaultValue: "PENDING",
      },
    });
  
    return Application;
  };
  