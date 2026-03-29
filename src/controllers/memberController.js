const { sequelize } = require("../models"); // Sequelize 인스턴스 가져오기
const { QueryTypes } = require("sequelize");
const { handleError } = require("../utils/errorHandler");
const pushService = require("../services/pushService");

const getMembers = async (req, res) => {
  try {
    const { project_id } = req.params;

    console.log("🔍 getMembers - project_id:", project_id);

    // Raw SQL 사용 (PostgreSQL snake_case 테이블명)
    const members = await sequelize.query(
      `SELECT
        pm.id,
        pm.project_id,
        pm.user_id,
        pm.role,
        pm.task,
        pm.joined_at,
        u.username,
        u.avatar,
        u.bio
      FROM project_members pm
      JOIN users u ON pm.user_id = u.user_id
      WHERE pm.project_id = :project_id
      ORDER BY pm.joined_at ASC`,
      {
        replacements: { project_id },
        type: QueryTypes.SELECT,
      }
    );

    console.log("✅ getMembers - Found members:", members.length);

    // 프론트엔드 기대 형식: { data: [{user_id, role, task, User: {username, avatar, bio}}] }
    res.status(200).json({
      data: members.map(m => ({
        user_id: m.user_id,
        role: m.role,
        task: m.task,
        User: {
          username: m.username,
          avatar: m.avatar,
          bio: m.bio
        }
      }))
    });
  } catch (error) {
    console.error("🚨 멤버 조회 오류:", error.message);
    handleError(res, error);
  }
};

// ✅ 팀원 추가
const addMember = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { user_id, role } = req.body;

    // Raw SQL INSERT
    const result = await sequelize.query(
      `INSERT INTO project_members (project_id, user_id, role, joined_at)
       VALUES (:project_id, :user_id, :role, NOW())
       RETURNING *`,
      {
        replacements: {
          project_id,
          user_id,
          role: role || "팀원",
        },
        type: QueryTypes.INSERT,
      }
    );

    // 푸시 알림 전송 (초대받은 사람에게)
    try {
      // 프로젝트 정보 조회
      const [projectInfo] = await sequelize.query(
        `SELECT title FROM projects WHERE project_id = :project_id`,
        { replacements: { project_id }, type: QueryTypes.SELECT }
      );

      // 초대한 사람 정보 조회
      const [inviterInfo] = await sequelize.query(
        `SELECT username FROM users WHERE user_id = :user_id`,
        { replacements: { user_id: req.user.userId }, type: QueryTypes.SELECT }
      );

      await pushService.sendToUser(
        user_id,
        pushService.PUSH_TYPES.PROJECT_INVITE,
        {
          inviterName: inviterInfo?.username || "팀장",
          projectName: projectInfo?.title || "프로젝트",
          projectId: project_id,
        }
      );
    } catch (pushError) {
      console.error("❌ Push notification failed:", pushError.message);
      // 푸시 실패는 팀원 추가 실패로 이어지지 않음
    }

    res.status(201).json({
      success: true,
      data: result[0][0],
    });
  } catch (error) {
    console.error("🚨 팀원 추가 오류:", error.message);
    handleError(res, error);
  }
};

// ✅ 팀원 역할/업무 수정 (단일 또는 다중 멤버 지원)
const updateMemberRole = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { project_id } = req.params;
    const { user_id, role, task, members } = req.body;

    // 다중 멤버 수정 모드
    if (members && Array.isArray(members)) {
      const updatedMembers = [];

      for (const member of members) {
        if (!member.user_id) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: "각 멤버에 user_id가 필요합니다.",
          });
        }

        // role과 task 중 하나라도 있어야 함
        if (member.role === undefined && member.task === undefined) {
          continue; // 수정할 내용이 없으면 건너뜀
        }

        // role 유효성 검사
        if (member.role !== undefined && !["팀장", "팀원"].includes(member.role)) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `유효하지 않은 role 값: ${member.role}. '팀장' 또는 '팀원'만 허용됩니다.`,
          });
        }

        // 동적 SET 절 생성
        const setClauses = [];
        const replacements = { project_id, user_id: member.user_id };

        if (member.role !== undefined) {
          setClauses.push("role = :role");
          replacements.role = member.role;
        }
        if (member.task !== undefined) {
          setClauses.push("task = :task");
          replacements.task = member.task;
        }
        setClauses.push("updated_at = NOW()");

        const [result] = await sequelize.query(
          `UPDATE project_members
           SET ${setClauses.join(", ")}
           WHERE project_id = :project_id AND user_id = :user_id
           RETURNING *`,
          {
            replacements,
            transaction,
          }
        );

        if (result && result.length > 0) {
          updatedMembers.push(result[0]);
        }
      }

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: `${updatedMembers.length}명의 팀원 정보가 수정되었습니다.`,
        updated_members: updatedMembers.map(m => ({
          user_id: m.user_id,
          role: m.role,
          task: m.task,
        })),
      });
    }

    // 단일 멤버 수정 모드
    if (!user_id) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "user_id가 필요합니다.",
      });
    }

    // role과 task 중 하나라도 있어야 함
    if (role === undefined && task === undefined) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "role 또는 task 중 하나 이상은 제공되어야 합니다.",
      });
    }

    // role 유효성 검사
    if (role !== undefined && !["팀장", "팀원"].includes(role)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `유효하지 않은 role 값: ${role}. '팀장' 또는 '팀원'만 허용됩니다.`,
      });
    }

    // 동적 SET 절 생성
    const setClauses = [];
    const replacements = { project_id, user_id };

    if (role !== undefined) {
      setClauses.push("role = :role");
      replacements.role = role;
    }
    if (task !== undefined) {
      setClauses.push("task = :task");
      replacements.task = task;
    }
    setClauses.push("updated_at = NOW()");

    const [result] = await sequelize.query(
      `UPDATE project_members
       SET ${setClauses.join(", ")}
       WHERE project_id = :project_id AND user_id = :user_id
       RETURNING *`,
      {
        replacements,
        transaction,
      }
    );

    if (!result || result.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "팀원을 찾을 수 없습니다.",
      });
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "팀원 정보가 수정되었습니다.",
      updated_members: [{
        user_id: result[0].user_id,
        role: result[0].role,
        task: result[0].task,
      }],
    });
  } catch (error) {
    await transaction.rollback();
    console.error("🚨 팀원 정보 수정 오류:", error.message);
    handleError(res, error);
  }
};

// ✅ 팀원 삭제
const removeMember = async (req, res) => {
  try {
    const { member_id } = req.params;

    // Raw SQL DELETE
    const result = await sequelize.query(
      `DELETE FROM project_members
       WHERE id = :member_id
       RETURNING *`,
      {
        replacements: { member_id },
        type: QueryTypes.DELETE,
      }
    );

    if (result[1].length === 0) {
      return res.status(404).json({
        success: false,
        message: "팀원을 찾을 수 없습니다.",
      });
    }

    res.status(200).json({
      success: true,
      message: "팀원이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("🚨 팀원 삭제 오류:", error.message);
    handleError(res, error);
  }
};

module.exports = {
  getMembers,
  addMember,
  updateMemberRole,
  removeMember,
};
