const { DeviceToken } = require("../models");

/**
 * Register or update device token for push notifications
 * @param {string} userId - User ID
 * @param {string} deviceToken - APNs device token (64 hex characters)
 * @param {string} platform - Platform type ('ios' or 'android')
 * @returns {Promise<DeviceToken>} Created or updated token record
 */
const registerDeviceToken = async (userId, deviceToken, platform = "ios") => {
  // Validate device token format (APNs tokens are 64 hex characters)
  if (platform === "ios" && !/^[a-fA-F0-9]{64}$/.test(deviceToken)) {
    throw new Error("유효하지 않은 디바이스 토큰 형식입니다.");
  }

  // Check if token already exists for this user
  const existingToken = await DeviceToken.findOne({
    where: { user_id: userId, device_token: deviceToken },
  });

  if (existingToken) {
    // Reactivate if previously deactivated
    if (!existingToken.is_active) {
      await existingToken.update({ is_active: true });
    }
    return existingToken;
  }

  // Check if same token registered to another user (device changed ownership)
  const tokenOnOtherUser = await DeviceToken.findOne({
    where: { device_token: deviceToken },
  });

  if (tokenOnOtherUser) {
    // Deactivate on old user and register for new user
    await tokenOnOtherUser.update({ is_active: false });
  }

  // Create new token record
  return await DeviceToken.create({
    user_id: userId,
    device_token: deviceToken,
    platform,
    is_active: true,
  });
};

/**
 * Deactivate device token (on logout, uninstall)
 * @param {string} userId - User ID
 * @param {string} deviceToken - APNs device token
 * @returns {Promise<{success: boolean}>}
 */
const deactivateDeviceToken = async (userId, deviceToken) => {
  const token = await DeviceToken.findOne({
    where: { user_id: userId, device_token: deviceToken },
  });

  if (!token) {
    throw new Error("디바이스 토큰을 찾을 수 없습니다.");
  }

  await token.update({ is_active: false });
  return { success: true };
};

/**
 * Deactivate all device tokens for user (account deletion, security)
 * @param {string} userId - User ID
 * @returns {Promise<{deactivatedCount: number}>}
 */
const deactivateAllUserTokens = async (userId) => {
  const [updatedCount] = await DeviceToken.update(
    { is_active: false },
    { where: { user_id: userId, is_active: true } }
  );

  return { deactivatedCount: updatedCount };
};

/**
 * Get user's active device tokens
 * @param {string} userId - User ID
 * @returns {Promise<DeviceToken[]>}
 */
const getUserDeviceTokens = async (userId) => {
  return await DeviceToken.findAll({
    where: { user_id: userId, is_active: true },
    attributes: ["id", "device_token", "platform", "created_at"],
  });
};

/**
 * Get active iOS device tokens for a user (used by push service)
 * @param {string} userId - User ID
 * @returns {Promise<string[]>} Array of device token strings
 */
const getActiveIOSTokens = async (userId) => {
  const tokens = await DeviceToken.findAll({
    where: {
      user_id: userId,
      is_active: true,
      platform: "ios",
    },
    attributes: ["device_token"],
  });

  return tokens.map((t) => t.device_token);
};

/**
 * Mark device token as inactive (invalid token from APNs)
 * @param {string} deviceToken - APNs device token
 * @returns {Promise<void>}
 */
const markTokenAsInactive = async (deviceToken) => {
  await DeviceToken.update(
    { is_active: false },
    { where: { device_token: deviceToken } }
  );
};

module.exports = {
  registerDeviceToken,
  deactivateDeviceToken,
  deactivateAllUserTokens,
  getUserDeviceTokens,
  getActiveIOSTokens,
  markTokenAsInactive,
};
