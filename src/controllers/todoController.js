const { Todo, Project } = require("../models");

// 프로젝트의 모든 투두 가져오기
const getTodos = async (req, res) => {
  try {
    const { project_id } = req.params;
    const todos = await Todo.findAll({
      where: { project_id },
      order: [["created_at", "ASC"]], // 생성순 정렬
    });
    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "투두 목록 조회 실패" });
  }
};

// 투두 생성
const addTodo = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { title } = req.body; // 프론트에서 text 대신 title로 보낸다면 매칭 필요
    
    const newTodo = await Todo.create({
      project_id,
      title: title,
      status: "PENDING",
    });
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(400).json({ message: "투두 생성 실패" });
  }
};

// 투두 수정 (상태 토글 등)
// 중요: URL 파라미터로 todo_id만 받습니다.
const updateTodo = async (req, res) => {
  try {
    const { todo_id } = req.params;
    const { status, title } = req.body;

    const todo = await Todo.findByPk(todo_id);
    if (!todo) {
      return res.status(404).json({ message: "투두를 찾을 수 없습니다." });
    }

    await todo.update({ status, title });
    res.json(todo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "투두 수정 실패" });
  }
};

// 투두 삭제
const deleteTodo = async (req, res) => {
  try {
    const { todo_id } = req.params;
    await Todo.destroy({ where: { todo_id } });
    res.json({ message: "삭제되었습니다." });
  } catch (error) {
    res.status(500).json({ message: "투두 삭제 실패" });
  }
};

module.exports = {
  getTodos,
  addTodo,
  updateTodo,
  deleteTodo,
};