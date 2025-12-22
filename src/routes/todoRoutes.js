const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todoController");
const authMiddleware = require("../middlewares/authMiddleware");

// GET /api/todos/:project_id  (프로젝트의 투두 조회)
router.get("/:project_id", todoController.getTodos);

// PUT /api/todos/:todo_id (투두 상태 수정)
// 프론트엔드 TodoBox.js가 이 경로를 호출합니다.
router.put("/:todo_id", authMiddleware, todoController.updateTodo);

// POST /api/todos/:project_id (투두 추가 - 필요 시 사용)
router.post("/:project_id", authMiddleware, todoController.addTodo);

// DELETE /api/todos/:todo_id
router.delete("/:todo_id", authMiddleware, todoController.deleteTodo);

module.exports = router;