const { Project, Recruitment, User, Todo, Timeline, ProjectMembers } = require("../models");

const createProject = async (data) => {
  const { title, description, user_id, recruitment_id, start_date, end_date, status, role } = data;

  // 모집공고 존재 여부 확인
  const recruitment = await Recruitment.findByPk(recruitment_id);
  if (!recruitment) throw new Error("유효한 모집공고가 필요합니다.");
};

// getAllProjects
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        { model: User, as: "User", attributes: ["username"] },  // 프로젝트 생성자
        { model: Recruitment, as: "Recruitment", attributes: ["title"] },
        {
          model: ProjectMembers,  // 프로젝트 팀원들
          include: [{ model: User, attributes: ["username"] }],
          attributes: ["role", "status", "joined_at"],
        },
      ],
    });

    return res.status(200).json(projects);
  } catch (err) {
    console.error("🔥 Sequelize Error:", err.message);
    return res.status(500).json({ message: "프로젝트 조회 실패", error: err.message });
  }
};

// getProjectById
const getProjectById = async (req, res) => {
  try {
    const { project_id } = req.params;
    const project = await Project.findByPk(project_id, {
      include: [
        { model: User, as: "User", attributes: ["username"] },
        { model: Recruitment, as: "Recruitment", attributes: ["title"] },
        { model: Todo },
        { model: Timeline },
        {
          model: ProjectMembers,  // 팀원들
          include: [{ model: User, attributes: ["username"] }],
          attributes: ["role", "status", "joined_at"],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
    }

    return res.status(200).json(project);
  } catch (err) {
    console.error("🔥 Sequelize Error:", err.message);
    return res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// getCompletedProjects
const getCompletedProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({ where: { status: "완료" } });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "완료된 프로젝트 조회 실패" });
  }
};

// updateProject
const updateProject = async (project_id, updateData) => {
  const project = await Project.findByPk(project_id);
  if (!project) throw new Error("프로젝트를 찾을 수 없습니다.");

  // status가 "완료"일 경우, end_date가 없으면 현재 날짜로 설정
  if (updateData.status === "완료" && !project.end_date) {
    updateData.end_date = new Date();
  }

  await project.update(updateData);
  return project;
};

// getMyProjects - 내 프로젝트 조회 (status, limit, offset 지원)
const getMyProjects = async (req, res) => {
  try {
    const user_id = req.user.user_id; // authMiddleware에서 설정된 사용자 ID
    const { status, limit = 10, offset = 0 } = req.query;
    const { sequelize } = require("../models");
    const { QueryTypes } = require("sequelize");

    // 상태 매핑: ongoing/recruiting → ACTIVE, completed → COMPLETED, cancelled → CANCELLED
    const statusMap = {
      'ongoing': 'ACTIVE',
      'recruiting': 'ACTIVE',  // 프론트엔드에서 recruiting으로 요청하는 경우도 처리
      'completed': 'COMPLETED',
      'cancelled': 'CANCELLED'
    };

    let statusFilter = '';
    if (status && statusMap[status]) {
      statusFilter = `AND p.status = '${statusMap[status]}'`;
    }

    const query = `
      SELECT
        p.project_id,
        p.title,
        p.description,
        p.status,
        p.created_at,
        p.updated_at,
        u.user_id,
        u.username,
        u.email,
        COUNT(DISTINCT r.recruitment_id) as recruitment_count
      FROM projects p
      LEFT JOIN users u ON p.leader_id = u.user_id
      LEFT JOIN recruitments r ON p.project_id = r.project_id
      WHERE p.leader_id = :user_id ${statusFilter}
      GROUP BY p.project_id, p.title, p.description, p.status, p.created_at, p.updated_at, u.user_id, u.username, u.email
      ORDER BY p.created_at DESC
      LIMIT :limit OFFSET :offset
    `;

    const projects = await sequelize.query(query, {
      replacements: {
        user_id,
        limit: parseInt(limit),
        offset: parseInt(offset)
      },
      type: QueryTypes.SELECT
    });

    // 프론트엔드가 기대하는 응답 형식으로 변환
    return res.status(200).json({
      success: true,
      items: projects,
      page: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: projects.length === parseInt(limit)
      }
    });
  } catch (err) {
    console.error("🔥 getMyProjects Error:", err.message);
    console.error("Error stack:", err.stack);
    return res.status(500).json({
      success: false,
      message: "내 프로젝트 조회 실패",
      error: err.message
    });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  updateProject,
  getCompletedProjects,
  getMyProjects,
};
