// src/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// GET /user
router.get("/", userController.getUsers);

// POST /user
router.post("/", userController.createUser);

// 추가 가능 예시:
// router.get("/:id", userController.getUserById);
// router.put("/:id", userController.updateUser);
// router.delete("/:id", userController.deleteUser);

module.exports = router;
