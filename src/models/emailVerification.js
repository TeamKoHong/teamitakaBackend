const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const EmailVerification = sequelize.define("EmailVerification", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: "email_verifications",
});

module.exports = EmailVerification;
