const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todoController");
const authMiddleware = require("../middlewares/authMiddleware");

// Dashboard-level todo list for the current user.
router.get("/", authMiddleware, todoController.getMyTodos);

module.exports = router;
