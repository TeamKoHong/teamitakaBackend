const { Notification } = require("../models");
const { Op } = require("sequelize");

/**
 * 사용자의 알림 목록 조회
 */
const getNotifications = async (user_id, { limit = 20, offset = 0, unreadOnly = false }) => {
  const where = { user_id };

  if (unreadOnly) {
    where.is_read = false;
  }

  const { count, rows } = await Notification.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });

  return {
    notifications: rows,
    total: count,
    unreadCount: await Notification.count({ where: { user_id, is_read: false } }),
  };
};

/**
 * 알림 읽음 처리
 */
const markAsRead = async (notification_id, user_id) => {
  const notification = await Notification.findOne({
    where: { id: notification_id, user_id },
  });

  if (!notification) {
    throw new Error("알림을 찾을 수 없습니다.");
  }

  await notification.update({ is_read: true });
  return notification;
};

/**
 * 모든 알림 읽음 처리
 */
const markAllAsRead = async (user_id) => {
  const [updatedCount] = await Notification.update(
    { is_read: true },
    { where: { user_id, is_read: false } }
  );

  return { updatedCount };
};

/**
 * 알림 생성 (내부 사용)
 */
const createNotification = async (user_id, message) => {
  return await Notification.create({
    user_id,
    message,
    is_read: false,
  });
};

/**
 * 알림 삭제
 */
const deleteNotification = async (notification_id, user_id) => {
  const notification = await Notification.findOne({
    where: { id: notification_id, user_id },
  });

  if (!notification) {
    throw new Error("알림을 찾을 수 없습니다.");
  }

  await notification.destroy();
  return { success: true };
};

/**
 * 읽지 않은 알림 개수 조회
 */
const getUnreadCount = async (user_id) => {
  return await Notification.count({ where: { user_id, is_read: false } });
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
  getUnreadCount,
};
