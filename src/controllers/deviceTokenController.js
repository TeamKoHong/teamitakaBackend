const deviceTokenService = require("../services/deviceTokenService");
const { handleError } = require("../utils/errorHandler");

/**
 * POST /api/user/device-token
 * Register or update device token for push notifications
 */
const registerDeviceToken = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { device_token, platform = "ios" } = req.body;

    if (!device_token) {
      return res.status(400).json({
        success: false,
        error: "MISSING_DEVICE_TOKEN",
        message: "디바이스 토큰이 필요합니다.",
      });
    }

    if (!["ios", "android"].includes(platform)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_PLATFORM",
        message: "플랫폼은 'ios' 또는 'android'만 가능합니다.",
      });
    }

    const result = await deviceTokenService.registerDeviceToken(
      userId,
      device_token,
      platform
    );

    res.status(200).json({
      success: true,
      message: "디바이스 토큰이 등록되었습니다.",
      data: {
        id: result.id,
        platform: result.platform,
        is_active: result.is_active,
      },
    });
  } catch (error) {
    if (error.message === "유효하지 않은 디바이스 토큰 형식입니다.") {
      return res.status(400).json({
        success: false,
        error: "INVALID_TOKEN_FORMAT",
        message: error.message,
      });
    }
    handleError(res, error);
  }
};

/**
 * DELETE /api/user/device-token
 * Deactivate device token (on logout)
 */
const deactivateDeviceToken = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { device_token } = req.body;

    if (!device_token) {
      return res.status(400).json({
        success: false,
        error: "MISSING_DEVICE_TOKEN",
        message: "디바이스 토큰이 필요합니다.",
      });
    }

    await deviceTokenService.deactivateDeviceToken(userId, device_token);

    res.status(200).json({
      success: true,
      message: "디바이스 토큰이 비활성화되었습니다.",
    });
  } catch (error) {
    if (error.message === "디바이스 토큰을 찾을 수 없습니다.") {
      return res.status(404).json({
        success: false,
        error: "TOKEN_NOT_FOUND",
        message: error.message,
      });
    }
    handleError(res, error);
  }
};

/**
 * GET /api/user/device-tokens
 * Get user's active device tokens
 */
const getDeviceTokens = async (req, res) => {
  try {
    const userId = req.user.userId;

    const tokens = await deviceTokenService.getUserDeviceTokens(userId);

    res.status(200).json({
      success: true,
      data: tokens,
      count: tokens.length,
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  registerDeviceToken,
  deactivateDeviceToken,
  getDeviceTokens,
};
