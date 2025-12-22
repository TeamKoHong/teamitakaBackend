module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define("Admin", {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: "ADMIN",
      },
    }, {
      tableName: "admins",
      freezeTableName: true,
      timestamps: true,
    });

    return Admin;
  };
  