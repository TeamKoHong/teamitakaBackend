const { sequelize } = require("../models"); // Sequelize 인스턴스 가져오기
const { QueryTypes } = require("sequelize");
const { handleError } = require("../utils/errorHandler");

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
        pm.joined_at,
        u.username,
        u.email,
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

    // 프론트엔드 기대 형식: { data: [{user_id, role, User: {username, email, avatar, bio}}] }
    res.status(200).json({
      data: members.map(m => ({
        user_id: m.user_id,
        role: m.role,
        User: {
          username: m.username,
          email: m.email,
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

    res.status(201).json({
      success: true,
      data: result[0][0],
    });
  } catch (error) {
    console.error("🚨 팀원 추가 오류:", error.message);
    handleError(res, error);
  }
};

// ✅ 팀원 역할 수정
const updateMemberRole = async (req, res) => {
  try {
    const { member_id } = req.params;
    const { role } = req.body;

    // Raw SQL UPDATE
    const result = await sequelize.query(
      `UPDATE project_members
       SET role = :role, updated_at = NOW()
       WHERE id = :member_id
       RETURNING *`,
      {
        replacements: { member_id, role },
        type: QueryTypes.UPDATE,
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
      message: "팀원 역할이 수정되었습니다.",
      data: result[1][0],
    });
  } catch (error) {
    console.error("🚨 팀원 역할 수정 오류:", error.message);
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
