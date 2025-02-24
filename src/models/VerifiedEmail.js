const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const VerifiedEmail = sequelize.define("VerifiedEmail", {
    id: {
      type: DataTypes.CHAR(36).BINARY,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    certified_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => {
        let now = new Date();
        now.setHours(now.getHours() + 24); // 24시간 후 만료
        return now;
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  return VerifiedEmail;
};