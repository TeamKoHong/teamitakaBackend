// src/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const deviceTokenController = require("../controllers/deviceTokenController");
const authenticateToken = require("../middlewares/authMiddleware");

// GET /user
router.get("/", userController.getUsers);

// POST /user
router.post("/", userController.createUser);

// 추가 가능 예시:
// router.get("/:id", userController.getUserById);
// router.put("/:id", userController.updateUser);
router.delete("/:id", authenticateToken, userController.deleteUser);

// POST /user/type-result - MBTI 성향 테스트 결과 저장
router.post("/type-result", authenticateToken, userController.updateMbtiType);

// ========================
// Device Token Routes (Push Notifications)
// ========================

// POST /user/device-token - Register device token
router.post("/device-token", authenticateToken, deviceTokenController.registerDeviceToken);

// DELETE /user/device-token - Deactivate device token
router.delete("/device-token", authenticateToken, deviceTokenController.deactivateDeviceToken);

// GET /user/device-tokens - Get user's device tokens
router.get("/device-tokens", authenticateToken, deviceTokenController.getDeviceTokens);

module.exports = router;
