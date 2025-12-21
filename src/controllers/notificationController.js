const notificationService = require("../services/notificationService");
const { handleError } = require("../utils/errorHandler");

/**
 * GET /api/notifications
 * 사용자의 알림 목록 조회
 */
const getNotifications = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;

    const result = await notificationService.getNotifications(user_id, {
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      unreadOnly: unreadOnly === "true" || unreadOnly === true,
    });

    res.status(200).json({
      success: true,
      data: result.notifications,
      total: result.total,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * PUT /api/notifications/:id/read
 * 알림 읽음 처리
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;

    const notification = await notificationService.markAsRead(id, user_id);

    res.status(200).json({
      success: true,
      message: "알림을 읽음 처리했습니다.",
      data: notification,
    });
  } catch (error) {
    if (error.message === "알림을 찾을 수 없습니다.") {
      return res.status(404).json({
        success: false,
        error: "NOTIFICATION_NOT_FOUND",
        message: error.message,
      });
    }
    handleError(res, error);
  }
};

/**
 * PUT /api/notifications/read-all
 * 모든 알림 읽음 처리
 */
const markAllAsRead = async (req, res) => {
  try {
    const user_id = req.user.userId;

    const result = await notificationService.markAllAsRead(user_id);

    res.status(200).json({
      success: true,
      message: `${result.updatedCount}개의 알림을 읽음 처리했습니다.`,
      updatedCount: result.updatedCount,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * DELETE /api/notifications/:id
 * 알림 삭제
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;

    await notificationService.deleteNotification(id, user_id);

    res.status(200).json({
      success: true,
      message: "알림이 삭제되었습니다.",
    });
  } catch (error) {
    if (error.message === "알림을 찾을 수 없습니다.") {
      return res.status(404).json({
        success: false,
        error: "NOTIFICATION_NOT_FOUND",
        message: error.message,
      });
    }
    handleError(res, error);
  }
};

/**
 * GET /api/notifications/unread-count
 * 읽지 않은 알림 개수 조회
 */
const getUnreadCount = async (req, res) => {
  try {
    const user_id = req.user.userId;

    const count = await notificationService.getUnreadCount(user_id);

    res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};
