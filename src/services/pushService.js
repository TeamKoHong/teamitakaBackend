const fs = require("fs");
const apnsConfig = require("../config/apnsConfig");
const deviceTokenService = require("./deviceTokenService");

let apnsClient = null;
let APNS, Notification, Priority;

/**
 * Push notification types
 */
const PUSH_TYPES = {
  TEAM_MATCH_REQUEST: "team_match_request",
  TEAM_MATCH_ACCEPTED: "team_match_accepted",
  NEW_MESSAGE: "new_message",
  PROJECT_UPDATE: "project_update",
  PROJECT_INVITE: "project_invite",
  REVIEW_REQUEST: "review_request",
  PROJECT_STATUS_CHANGE: "project_status_change",
};

/**
 * Initialize APNs client (lazy loading)
 * @returns {Object|null} APNs client instance or null if unavailable
 */
const initializeAPNs = () => {
  if (apnsClient) return apnsClient;

  try {
    // Lazy load apns2 module
    if (!APNS) {
      const apns2 = require("apns2");
      APNS = apns2.APNS;
      Notification = apns2.Notification;
      Priority = apns2.Priority;
    }

    // Check if key file exists
    if (!fs.existsSync(apnsConfig.keyPath)) {
      console.warn("⚠️ APNs key file not found:", apnsConfig.keyPath);
      console.warn("⚠️ Push notifications will be disabled");
      return null;
    }

    const signingKey = fs.readFileSync(apnsConfig.keyPath, "utf8");

    apnsClient = new APNS({
      team: apnsConfig.teamId,
      keyId: apnsConfig.keyId,
      signingKey: signingKey,
      defaultTopic: apnsConfig.bundleId,
      host: apnsConfig.isProduction
        ? apnsConfig.host.production
        : apnsConfig.host.sandbox,
    });

    console.log("✅ APNs client initialized:", {
      environment: apnsConfig.isProduction ? "production" : "sandbox",
      teamId: apnsConfig.teamId,
      bundleId: apnsConfig.bundleId,
    });

    return apnsClient;
  } catch (error) {
    console.error("❌ Failed to initialize APNs client:", error.message);
    return null;
  }
};

/**
 * Build notification payload based on type
 * @param {string} type - Notification type from PUSH_TYPES
 * @param {Object} data - Notification data
 * @returns {Object|null} Notification payload or null
 */
const buildNotificationPayload = (type, data) => {
  const payloads = {
    [PUSH_TYPES.TEAM_MATCH_REQUEST]: {
      title: "새로운 팀원 요청",
      body: `${data.senderName || "누군가"}님이 팀 참여를 요청했습니다.`,
      data: {
        type,
        recruitmentId: data.recruitmentId,
        applicationId: data.applicationId,
      },
    },
    [PUSH_TYPES.TEAM_MATCH_ACCEPTED]: {
      title: "팀 합류 승인",
      body: `${data.projectName || "팀"} 팀에 합류되었습니다!`,
      data: {
        type,
        projectId: data.projectId,
      },
    },
    [PUSH_TYPES.NEW_MESSAGE]: {
      title: data.senderName || "새 메시지",
      body: data.messagePreview || "새로운 메시지가 도착했습니다.",
      data: {
        type,
        conversationId: data.conversationId,
      },
    },
    [PUSH_TYPES.PROJECT_UPDATE]: {
      title: data.projectName || "프로젝트 업데이트",
      body: data.updateMessage || "프로젝트에 새로운 업데이트가 있습니다.",
      data: {
        type,
        projectId: data.projectId,
        updateType: data.updateType,
      },
    },
    [PUSH_TYPES.PROJECT_INVITE]: {
      title: "프로젝트 초대",
      body: `${data.inviterName || "팀장"}님이 '${data.projectName || "프로젝트"}' 프로젝트에 초대했습니다.`,
      data: {
        type,
        projectId: data.projectId,
      },
    },
    [PUSH_TYPES.REVIEW_REQUEST]: {
      title: "팀원 평가 요청",
      body: `'${data.projectName || "프로젝트"}' 프로젝트의 팀원 평가를 해주세요.`,
      data: {
        type,
        projectId: data.projectId,
      },
    },
    [PUSH_TYPES.PROJECT_STATUS_CHANGE]: {
      title: data.projectName || "프로젝트",
      body: `프로젝트 상태가 '${data.newStatus || "변경됨"}'(으)로 변경되었습니다.`,
      data: {
        type,
        projectId: data.projectId,
        status: data.newStatus,
      },
    },
  };

  return payloads[type] || null;
};

/**
 * Send push notification to a single device
 * @param {string} deviceToken - APNs device token
 * @param {Object} payload - Notification payload
 * @returns {Promise<{success: boolean, error?: string}>}
 */
const sendToDevice = async (deviceToken, payload) => {
  const client = initializeAPNs();
  if (!client) {
    console.warn("⚠️ APNs client not available, skipping push");
    return { success: false, error: "APNs client not initialized" };
  }

  try {
    const notification = new Notification(deviceToken, {
      aps: {
        alert: {
          title: payload.title,
          body: payload.body,
        },
        sound: "default",
        badge: payload.badge || 1,
      },
      ...payload.data,
    });

    notification.priority = Priority.immediate;

    await client.send(notification);
    console.log("✅ Push sent to device:", deviceToken.substring(0, 16) + "...");
    return { success: true };
  } catch (error) {
    console.error("❌ Push failed:", error.reason || error.message);

    // Handle invalid token - mark as inactive
    if (error.reason === "BadDeviceToken" || error.reason === "Unregistered") {
      await deviceTokenService.markTokenAsInactive(deviceToken);
      console.log("📱 Device token marked as inactive:", deviceToken.substring(0, 16) + "...");
    }

    return { success: false, error: error.reason || error.message };
  }
};

/**
 * Send push notification to a user (all their iOS devices)
 * @param {string} userId - User ID
 * @param {string} type - Notification type from PUSH_TYPES
 * @param {Object} data - Notification data
 * @returns {Promise<{success: boolean, sent: number, total: number}>}
 */
const sendToUser = async (userId, type, data) => {
  const payload = buildNotificationPayload(type, data);
  if (!payload) {
    console.error("❌ Unknown notification type:", type);
    return { success: false, sent: 0, total: 0, error: "Unknown notification type" };
  }

  // Get all active iOS device tokens for user
  const deviceTokens = await deviceTokenService.getActiveIOSTokens(userId);

  if (deviceTokens.length === 0) {
    console.log("📱 No active iOS devices for user:", userId);
    return { success: true, sent: 0, total: 0 };
  }

  const results = await Promise.allSettled(
    deviceTokens.map((token) => sendToDevice(token, payload))
  );

  const successCount = results.filter(
    (r) => r.status === "fulfilled" && r.value.success
  ).length;

  console.log(`📱 Push sent to ${successCount}/${deviceTokens.length} devices for user:`, userId);

  return {
    success: true,
    sent: successCount,
    total: deviceTokens.length,
  };
};

/**
 * Send push to multiple users
 * @param {string[]} userIds - Array of user IDs
 * @param {string} type - Notification type from PUSH_TYPES
 * @param {Object} data - Notification data
 * @returns {Promise<{success: boolean, usersNotified: number, totalUsers: number}>}
 */
const sendToUsers = async (userIds, type, data) => {
  const results = await Promise.allSettled(
    userIds.map((userId) => sendToUser(userId, type, data))
  );

  const successCount = results.filter(
    (r) => r.status === "fulfilled" && r.value.success
  ).length;

  return {
    success: true,
    usersNotified: successCount,
    totalUsers: userIds.length,
  };
};

/**
 * Check if push service is available
 * @returns {boolean}
 */
const isAvailable = () => {
  return initializeAPNs() !== null;
};

module.exports = {
  initializeAPNs,
  sendToDevice,
  sendToUser,
  sendToUsers,
  isAvailable,
  PUSH_TYPES,
};
