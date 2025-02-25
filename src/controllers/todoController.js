const { Todo } = require("../models");
const { handleError } = require("../utils/errorHandler");

// ✅ 할 일 조회
const getTodos = async (req, res) => {
  try {
    const { project_id } = req.params;
    const todos = await Todo.findAll({
      where: { project_id },
      order: [["createdAt", "ASC"]],
    });
    res.status(200).json(todos);
  } catch (error) {
    handleError(res, error);
  }
};

// ✅ 할 일 추가
const addTodo = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { content, is_completed } = req.body;

    const newTodo = await Todo.create({
      project_id,
      content,
      is_completed: is_completed || false,
    });

    res.status(201).json(newTodo);
  } catch (error) {
    handleError(res, error);
  }
};

// ✅ 할 일 상태 변경
const updateTodo = async (req, res) => {
  try {
    const { todo_id } = req.params;
    const { is_completed } = req.body;

    const todo = await Todo.findByPk(todo_id);
    if (!todo) {
      return res.status(404).json({ message: "할 일을 찾을 수 없습니다." });
    }

    await todo.update({ is_completed });
    res.json(todo);
  } catch (error) {
    handleError(res, error);
  }
};

// ✅ 할 일 삭제
const deleteTodo = async (req, res) => {
  try {
    const { todo_id } = req.params;

    const todo = await Todo.findByPk(todo_id);
    if (!todo) {
      return res.status(404).json({ message: "할 일을 찾을 수 없습니다." });
    }

    await todo.destroy();
    res.json({ message: "할 일이 삭제되었습니다." });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getTodos,
  addTodo,
  updateTodo,
  deleteTodo,
};
