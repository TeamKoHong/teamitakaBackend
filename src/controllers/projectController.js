const { Project, Recruitment, User, Todo, Timeline, ProjectMembers, Application, sequelize } = require("../models");
const projectService = require("../services/projectService");
const { assertProjectLeaderRecord, assertProjectMemberRecord, sameId } = require("../utils/projectAccess");

const createProject = async (req, res) => {
  try {
    // JWT에서 user_id 가져오기 (authMiddleware가 설정)
    const user_id = req.user.userId;

    // 프로젝트 생성 (recruitment_id 불필요)
    const newProject = await Project.create({
      ...req.body,
      user_id,
      status: req.body.status || "ACTIVE"
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error("🚨 createProject Error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// getAllProjects
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      order: [["created_at", "DESC"]],
      include: [
        { model: User, as: "User", attributes: ["username"] },  // 프로젝트 생성자
        { model: Recruitment, as: "Recruitments", attributes: ["title", "status"] },  // 프로젝트의 모집공고들
        {
          model: ProjectMembers,
          as: "ProjectMembers",
          include: [{ model: User, attributes: ["username"] }],
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
        { model: User, as: "User", attributes: ["username"] },  // 프로젝트 생성자
        { model: Recruitment, as: "Recruitments", attributes: ["title", "status", "description"] },  // 프로젝트의 모집공고들
        { model: Todo },
        { model: Timeline },
        {
          model: ProjectMembers,
          as: "ProjectMembers",
          include: [{ model: User, attributes: ["username"] }],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
    }

    await assertProjectMemberRecord(project, req.user?.userId);

    return res.status(200).json(project);
  } catch (err) {
    console.error("🔥 Sequelize Error:", err.message);
    return res.status(err.status || 500).json({ message: err.message || "서버 오류", error: err.message });
  }
};

// getCompletedProjects
const getCompletedProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({ where: { status: "COMPLETED" } });
    res.json(projects);
  } catch (err) {
    console.error("🔥 getCompletedProjects Error:", err.message);
    res.status(500).json({ message: "완료된 프로젝트 조회 실패" });
  }
};

// updateProject
const updateProject = async (req, res) => {
  try {
    const { project_id } = req.params;
    const userId = req.user?.userId;
    const project = await Project.findByPk(project_id);

    await assertProjectLeaderRecord(project, userId, "팀장만 프로젝트를 수정할 수 있습니다.");

    const updatedProject = await projectService.updateProject(project_id, { ...req.body });
    return res.status(200).json(updatedProject);
  } catch (err) {
    console.error("🔥 updateProject Error:", err.message);
    return res.status(err.status || 500).json({ message: err.message || "프로젝트 수정 실패", error: err.message });
  }
};

// getMyProjects - 내 프로젝트 조회 (status, limit, offset, evaluation_status, isFavorite 지원)
const getMyProjects = async (req, res) => {
  try {
    const user_id = req.user.userId; // authMiddleware에서 설정된 사용자 ID (JWT 페이로드의 userId 필드)
    const { status, evaluation_status, isFavorite, limit = 10, offset = 0 } = req.query;
    const { sequelize } = require("../models");
    const { QueryTypes } = require("sequelize");

    // 상태 매핑: Project 모델 ENUM 값에 맞춤 ("ACTIVE", "COMPLETED", "CANCELLED")
    const statusMap = {
      'ongoing': 'ACTIVE',       // 진행 중인 프로젝트
      'active': 'ACTIVE',        // 활성 프로젝트 (별칭)
      'completed': 'COMPLETED',  // 완료된 프로젝트
      'cancelled': 'CANCELLED'   // 취소된 프로젝트
    };

    let statusFilter = '';
    if (status && statusMap[status]) {
      statusFilter = `AND p.status = '${statusMap[status]}'`;
    }

    // 1. 사용자가 속한 프로젝트 ID 조회
    const myProjectsQuery = `
      SELECT DISTINCT project_id
      FROM project_members
      WHERE user_id = :user_id
    `;
    const myProjects = await sequelize.query(myProjectsQuery, {
      replacements: { user_id },
      type: QueryTypes.SELECT
    });

    if (myProjects.length === 0) {
      return res.status(200).json({
        success: true,
        items: [],
        page: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: false
        }
      });
    }

    const projectIds = myProjects.map(p => p.project_id);

    // 2. 프로젝트 기본 정보 + 팀원 수 + 평가 정보 + 멤버 목록 + 최근 피드 시간 + 즐겨찾기 조회
    const query = `
      WITH member_counts AS (
        SELECT
          project_id,
          COUNT(*) as member_count
        FROM project_members
        GROUP BY project_id
      ),
      user_review_counts AS (
        SELECT
          project_id,
          COUNT(*) as completed_reviews
        FROM reviews
        WHERE reviewer_id = :user_id
        GROUP BY project_id
      ),
      project_members_details AS (
        SELECT
          pm.project_id,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', u.user_id,
              'name', u.username,
              'position', pm.role,
              'avatar', NULL,
              'joined_at', pm.joined_at
            ) ORDER BY pm.joined_at ASC
          ) as members
        FROM project_members pm
        JOIN users u ON pm.user_id = u.user_id
        GROUP BY pm.project_id
      ),
      last_feed_times AS (
        SELECT
          project_id,
          MAX("createdAt") as last_feed_at
        FROM project_posts
        GROUP BY project_id
      ),
      user_favorites AS (
        SELECT project_id
        FROM scraps
        WHERE user_id = :user_id AND project_id IS NOT NULL
      )
      SELECT
        p.project_id,
        p.title,
        p.description,
        p.status,
        p.start_date,
        p.end_date,
        p.created_at,
        p.updated_at,
        p.meeting_time,
        p.favorite_count,
        (SELECT recruitment_id FROM recruitments WHERE project_id = p.project_id ORDER BY created_at DESC LIMIT 1) as recruitment_id,
        (SELECT COUNT(*) FROM recruitments WHERE project_id = p.project_id) as recruitment_count,
        COALESCE(mc.member_count, 0) as member_count,
        COALESCE(urc.completed_reviews, 0) as completed_reviews,
        COALESCE(pmd.members, '[]'::json) as members,
        lft.last_feed_at,
        CASE WHEN uf.project_id IS NOT NULL THEN true ELSE false END as is_favorite,
        CASE
          WHEN p.end_date IS NOT NULL AND p.status = 'COMPLETED' THEN
            EXTRACT(DAY FROM NOW() - p.end_date)::INTEGER
          ELSE NULL
        END as d_day,
        CASE
          WHEN COALESCE(mc.member_count, 0) <= 1 THEN 'NOT_REQUIRED'
          WHEN COALESCE(urc.completed_reviews, 0) >= (COALESCE(mc.member_count, 0) - 1) THEN 'COMPLETED'
          ELSE 'PENDING'
        END as evaluation_status
      FROM projects p
      LEFT JOIN member_counts mc ON p.project_id = mc.project_id
      LEFT JOIN user_review_counts urc ON p.project_id = urc.project_id
      LEFT JOIN project_members_details pmd ON p.project_id = pmd.project_id
      LEFT JOIN last_feed_times lft ON p.project_id = lft.project_id
      LEFT JOIN user_favorites uf ON p.project_id = uf.project_id
      WHERE p.project_id IN (:projectIds) ${statusFilter}
      ORDER BY p.created_at DESC
    `;

    const allProjects = await sequelize.query(query, {
      replacements: {
        user_id,
        projectIds
      },
      type: QueryTypes.SELECT
    });

    // 3. evaluation_status 및 isFavorite 필터링 (선택)
    let filteredProjects = allProjects;

    // evaluation_status 필터
    if (evaluation_status) {
      const validStatuses = ['COMPLETED', 'PENDING', 'NOT_REQUIRED'];
      if (validStatuses.includes(evaluation_status.toUpperCase())) {
        filteredProjects = filteredProjects.filter(
          p => p.evaluation_status === evaluation_status.toUpperCase()
        );
      }
    }

    // isFavorite 필터
    if (isFavorite !== undefined) {
      const isFav = isFavorite === 'true' || isFavorite === true;
      filteredProjects = filteredProjects.filter(p => p.is_favorite === isFav);
    }

    // 4. 페이지네이션 적용
    const total = filteredProjects.length;
    const paginatedProjects = filteredProjects.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    // 5. 응답 형식 변환
    const items = paginatedProjects.map(p => ({
      project_id: p.project_id,
      title: p.title,
      description: p.description,
      status: p.status,
      start_date: p.start_date,
      end_date: p.end_date,
      d_day: p.d_day !== null ? parseInt(p.d_day) : null,
      created_at: p.created_at,
      updated_at: p.updated_at,
      recruitment_id: p.recruitment_id || null,
      recruitment_count: parseInt(p.recruitment_count) || 0,
      evaluation_status: p.evaluation_status,
      meeting_: p.meeting_time || null,
      members: typeof p.members === 'string' ? JSON.parse(p.members) : (p.members || []),
      // 즐겨찾기 정보
      is_favorite: p.is_favorite || false,
      favorite_count: parseInt(p.favorite_count) || 0,
      // 추가 정보 (디버깅용, 프론트엔드에서 활용 가능)
      member_count: parseInt(p.member_count) || 0,
      completed_reviews: parseInt(p.completed_reviews) || 0,
      required_reviews: Math.max(0, (parseInt(p.member_count) || 0) - 1)
    }));

    return res.status(200).json({
      success: true,
      items,
      page: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + items.length < total
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

// createProjectFromRecruitment - 모집공고를 프로젝트로 전환 (킥오프)
const createProjectFromRecruitment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { recruitment_id } = req.params;
    const { title, resolution, start_date, end_date, memberUserIds } = req.body;

    // 1. 필수 파라미터 검증
    if (!title) {
      await transaction.rollback();
      return res.status(400).json({ error: "프로젝트 제목은 필수입니다." });
    }

    if (!memberUserIds || !Array.isArray(memberUserIds) || memberUserIds.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "프로젝트 멤버를 선택해주세요." });
    }

    // 2. 모집공고 조회
    const recruitment = await Recruitment.findByPk(recruitment_id, { transaction });
    if (!recruitment) {
      await transaction.rollback();
      return res.status(404).json({ error: "모집공고를 찾을 수 없습니다." });
    }

    if (!sameId(recruitment.user_id, req.user?.userId)) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        error: "FORBIDDEN",
        message: "모집글 작성자만 프로젝트를 시작할 수 있습니다."
      });
    }

    // 3. 이미 프로젝트로 전환되었는지 확인
    if (recruitment.project_id) {
      await transaction.rollback();
      return res.status(400).json({
        error: "이미 프로젝트로 전환된 모집공고입니다.",
        project_id: recruitment.project_id
      });
    }

    const selectedMemberUserIds = [
      ...new Set(
        memberUserIds
          .filter(Boolean)
          .map((userId) => String(userId))
          .filter((userId) => !sameId(userId, recruitment.user_id))
      ),
    ];

    if (selectedMemberUserIds.length > 0) {
      const approvedApplications = await Application.findAll({
        where: {
          recruitment_id,
          user_id: selectedMemberUserIds,
          status: "APPROVED",
        },
        attributes: ["user_id"],
        transaction,
      });
      const approvedUserIds = new Set(approvedApplications.map((application) => String(application.user_id)));
      const invalidMemberUserIds = selectedMemberUserIds.filter((userId) => !approvedUserIds.has(userId));

      if (invalidMemberUserIds.length > 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: "INVALID_PROJECT_MEMBERS",
          message: "승인된 지원자만 프로젝트 멤버로 추가할 수 있습니다.",
          invalidMemberUserIds,
        });
      }
    }

    // 4. 새 프로젝트 생성
    const newProject = await Project.create({
      title: title,
      description: recruitment.description,
      resolution: resolution || null,
      project_type: recruitment.project_type || null,
      user_id: recruitment.user_id,
      start_date: start_date || null,
      end_date: end_date || null,
      status: "ACTIVE"
    }, { transaction });

    // 5. 프로젝트 멤버 추가
    const members = [];

    // 5-1. 모집공고 작성자를 리더로 추가
    const leaderMember = await ProjectMembers.create({
      project_id: newProject.project_id,
      user_id: recruitment.user_id,
      role: "LEADER",
      status: "ACTIVE",
      joined_at: new Date()
    }, { transaction });
    members.push(leaderMember);

    // 5-2. 선택된 멤버들을 프로젝트에 추가
    for (const userId of selectedMemberUserIds) {
      const member = await ProjectMembers.create({
        project_id: newProject.project_id,
        user_id: userId,
        role: "MEMBER",
        status: "ACTIVE",
        joined_at: new Date()
      }, { transaction });
      members.push(member);
    }

    // 6. 모집공고 업데이트 (프로젝트 연결 + 상태 CLOSED)
    await recruitment.update({
      project_id: newProject.project_id,
      status: "CLOSED"
    }, { transaction });

    // 7. Transaction commit
    await transaction.commit();

    // 8. 응답 반환
    return res.status(201).json({
      project_id: newProject.project_id,
      title: newProject.title,
      resolution: newProject.resolution,
      project_type: newProject.project_type,
      user_id: newProject.user_id,
      start_date: newProject.start_date,
      end_date: newProject.end_date,
      status: newProject.status,
      created_at: newProject.createdAt,
      members: members.map(m => ({
        user_id: m.user_id,
        role: m.role,
        status: m.status,
        joined_at: m.joined_at
      })),
      recruitment: {
        recruitment_id: recruitment.recruitment_id,
        status: recruitment.status,
        project_id: recruitment.project_id
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error("🚨 createProjectFromRecruitment Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// getEvalTargets - 프로젝트 평가 대상 목록 조회
const getEvalTargets = async (req, res) => {
  try {
    const { project_id } = req.params;
    const reviewer_id = req.user.userId;
    const { sequelize } = require("../models");
    const { QueryTypes } = require("sequelize");

    // 프로젝트 존재 여부 확인
    const project = await Project.findByPk(project_id);
    if (!project) {
      return res.status(404).json({ error: "프로젝트를 찾을 수 없습니다." });
    }

    await assertProjectMemberRecord(project, reviewer_id);

    // 평가 대상 목록 조회 (자기 자신 제외)
    const query = `
      SELECT
        pm.user_id as id,
        u.username as name,
        pm.role,
        CASE
          WHEN r.review_id IS NOT NULL THEN 'completed'
          ELSE 'pending'
        END as status
      FROM project_members pm
      JOIN users u ON pm.user_id = u.user_id
      LEFT JOIN reviews r ON r.project_id = pm.project_id
        AND r.reviewer_id = :reviewer_id
        AND r.reviewee_id = pm.user_id
      WHERE pm.project_id = :project_id
        AND pm.user_id != :reviewer_id
      ORDER BY pm.joined_at ASC
    `;

    const targets = await sequelize.query(query, {
      replacements: { project_id, reviewer_id },
      type: QueryTypes.SELECT
    });

    // 다음 평가 대상자 찾기 (첫 번째 pending 상태)
    const nextPendingMember = targets.find(t => t.status === 'pending') || null;

    return res.status(200).json({
      targets,
      nextPendingMember
    });

  } catch (err) {
    console.error("🔥 getEvalTargets Error:", err.message);
    return res.status(500).json({
      error: "평가 대상 목록 조회 실패",
      message: err.message
    });
  }
};

// toggleProjectFavorite - 프로젝트 즐겨찾기 토글
const toggleProjectFavorite = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { project_id } = req.params;

    const result = await projectService.toggleProjectFavorite(user_id, project_id);
    return res.status(200).json(result);
  } catch (err) {
    console.error("🔥 toggleProjectFavorite Error:", err.message);
    if (err.message === "프로젝트를 찾을 수 없습니다.") {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: "즐겨찾기 처리 실패", message: err.message });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  getCompletedProjects,
  getMyProjects,
  createProjectFromRecruitment,
  getEvalTargets,
  toggleProjectFavorite,
};
