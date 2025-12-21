const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/authMiddleware");

// GET /api/notifications - 알림 목록 조회
router.get("/", authMiddleware, notificationController.getNotifications);

// GET /api/notifications/unread-count - 읽지 않은 알림 개수
router.get("/unread-count", authMiddleware, notificationController.getUnreadCount);

// PUT /api/notifications/read-all - 모든 알림 읽음 처리
router.put("/read-all", authMiddleware, notificationController.markAllAsRead);

// PUT /api/notifications/:id/read - 개별 알림 읽음 처리
router.put("/:id/read", authMiddleware, notificationController.markAsRead);

// DELETE /api/notifications/:id - 알림 삭제
router.delete("/:id", authMiddleware, notificationController.deleteNotification);

module.exports = router;
