const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const EmailVerification = sequelize.define("EmailVerification", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING(255), allowNull: false },
    purpose: { type: DataTypes.ENUM("signup", "login", "change"), allowNull: false },
    jti: { type: DataTypes.UUID, allowNull: false },
    token_hash: { type: DataTypes.STRING(255), allowNull: true },
    code_hash: { type: DataTypes.STRING(255), allowNull: true },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    consumed_at: { type: DataTypes.DATE, allowNull: true },
    sent_provider: { type: DataTypes.STRING(50), allowNull: true },
    created_ip: { type: DataTypes.STRING(64), allowNull: true },
    ua: { type: DataTypes.STRING(512), allowNull: true },
    attempt_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  }, {
    tableName: "email_verifications",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return EmailVerification;
};


