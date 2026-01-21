const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DeviceToken = sequelize.define("DeviceToken", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
      onDelete: "CASCADE",
    },
    device_token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "APNs device token from iOS app",
    },
    platform: {
      type: DataTypes.ENUM("ios", "android"),
      allowNull: false,
      defaultValue: "ios",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Token validity status",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  }, {
    tableName: "device_tokens",
    freezeTableName: true,
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "device_token"],
        name: "unique_user_device_token",
      },
      {
        fields: ["user_id"],
        name: "idx_device_tokens_user_id",
      },
    ],
  });

  return DeviceToken;
};
