const { ProjectMember, User } = require("../models");
const { handleError } = require("../utils/errorHandler");

// ✅ 팀원 목록 조회
const getMembers = async (req, res) => {
  try {
    const { project_id } = req.params;

    const members = await ProjectMember.findAll({
      where: { project_id },
      include: [{ model: User, attributes: ["username", "email"] }],
    });

    res.status(200).json(members);
  } catch (error) {
    handleError(res, error);
  }
};

// ✅ 팀원 추가
const addMember = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { user_id, role } = req.body;

    const newMember = await ProjectMember.create({
      project_id,
      user_id,
      role: role || "팀원", // 기본값: 팀원
    });

    res.status(201).json(newMember);
  } catch (error) {
    handleError(res, error);
  }
};

// ✅ 팀원 역할 수정
const updateMemberRole = async (req, res) => {
  try {
    const { member_id } = req.params;
    const { role } = req.body;

    const member = await ProjectMember.findByPk(member_id);
    if (!member) {
      return res.status(404).json({ message: "팀원을 찾을 수 없습니다." });
    }

    await member.update({ role });
    res.status(200).json({ message: "팀원 역할이 수정되었습니다.", member });
  } catch (error) {
    handleError(res, error);
  }
};

// ✅ 팀원 삭제
const removeMember = async (req, res) => {
  try {
    const { member_id } = req.params;

    const member = await ProjectMember.findByPk(member_id);
    if (!member) {
      return res.status(404).json({ message: "팀원을 찾을 수 없습니다." });
    }

    await member.destroy();
    res.status(200).json({ message: "팀원이 삭제되었습니다." });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getMembers,
  addMember,
  updateMemberRole,
  removeMember,
};
