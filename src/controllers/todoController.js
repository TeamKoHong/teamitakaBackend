const { Todo } = require("../models");
const { handleError } = require("../utils/errorHandler");

// ✅ 할 일 조회
const getTodos = async (req, res) => {
  try {
    const { project_id } = req.params;
    const todos = await Todo.findAll({
      where: { project_id },
      order: [["created_at", "ASC"]],
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
    const { title, description, priority, due_date, user_id } = req.body;

    const newTodo = await Todo.create({
      project_id,
      user_id,
      title,
      description,
      priority: priority || "MEDIUM",
      due_date,
      status: "PENDING",
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
    const { status, title, description, priority, due_date } = req.body;

    const todo = await Todo.findByPk(todo_id);
    if (!todo) {
      return res.status(404).json({ message: "할 일을 찾을 수 없습니다." });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (due_date !== undefined) updateData.due_date = due_date;

    await todo.update(updateData);
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
