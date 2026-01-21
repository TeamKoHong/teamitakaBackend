const { Todo, Project, User } = require("../models");
const { Op } = require("sequelize");

// 본인의 미완료 투두 가져오기
const getTodos = async (req, res) => {
  try {
    const { project_id } = req.params;
    const user_id = req.user?.userId;

    const todos = await Todo.findAll({
      where: {
        project_id,
        user_id,
        status: { [Op.ne]: 'COMPLETED' }
      },
      include: [{
        model: User,
        as: 'assignedUser',
        attributes: ['user_id', 'username', 'avatar']
      }],
      order: [["created_at", "ASC"]],
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
    const { title } = req.body;
    const user_id = req.user?.userId;

    const newTodo = await Todo.create({
      project_id,
      user_id,
      title,
      status: "PENDING",
    });
    res.status(201).json(newTodo);
  } catch (error) {
    console.error("투두 생성 에러:", error);
    res.status(400).json({ message: "투두 생성 실패" });
  }
};

// 투두 수정 (상태 토글 등)
const updateTodo = async (req, res) => {
  try {
    const { todo_id } = req.params;
    const { status, title } = req.body;

    const todo = await Todo.findByPk(todo_id);
    if (!todo) {
      return res.status(404).json({ message: "투두를 찾을 수 없습니다." });
    }

    // 완료 상태로 변경 시 완료 정보 기록
    if (status === 'COMPLETED') {
      await todo.update({
        status,
        title: title || todo.title,
        completed_at: new Date(),
        completed_by: req.user?.userId
      });
    } else {
      await todo.update({ status, title });
    }

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

// 팀 전체 활동 로그 조회 (완료된 투두 목록)
const getActivityLog = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { limit = 5, offset = 0 } = req.query;

    const logs = await Todo.findAndCountAll({
      where: {
        project_id,
        status: 'COMPLETED'
      },
      include: [{
        model: User,
        as: 'completedByUser',
        attributes: ['user_id', 'username', 'avatar']
      }],
      order: [['completed_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      activity_logs: logs.rows,
      total: logs.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error("활동 로그 조회 에러:", error);
    res.status(500).json({ message: "활동 로그 조회 실패" });
  }
};

// 활동 로그 삭제 (팀장 또는 작성자만 가능)
const deleteActivityLog = async (req, res) => {
  try {
    const { project_id, todo_id } = req.params;
    const userId = req.user?.userId;

    // 프로젝트 조회 (팀장 확인용)
    const project = await Project.findByPk(project_id);
    if (!project) {
      return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
    }

    // 투두 조회
    const todo = await Todo.findOne({
      where: { todo_id, project_id, status: 'COMPLETED' }
    });
    if (!todo) {
      return res.status(404).json({ message: "활동 로그를 찾을 수 없습니다." });
    }

    // 권한 체크: 팀장(프로젝트 owner) 또는 작성자(completed_by)
    const isOwner = userId === project.user_id;
    const isAuthor = userId === todo.completed_by;

    if (!isOwner && !isAuthor) {
      return res.status(403).json({ message: "삭제 권한이 없습니다." });
    }

    // 실제 삭제
    await todo.destroy();

    res.json({ message: "활동 로그가 삭제되었습니다." });
  } catch (error) {
    console.error("활동 로그 삭제 에러:", error);
    res.status(500).json({ message: "활동 로그 삭제 실패" });
  }
};

module.exports = {
  getTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  getActivityLog,
  deleteActivityLog,
};