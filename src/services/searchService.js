const { Recruitment, User, Project } = require("../models");
const { Op } = require("sequelize");

const searchKeyword = async (q) => {
  const keyword = `%${q}%`;

  // 모집공고, 사용자, 프로젝트 검색
  const [recruitments, users, projects] = await Promise.all([
    Recruitment.findAll({
      where: { title: { [Op.like]: keyword } },
      attributes: ["recruitment_id", "title", "status"],
    }),
    User.findAll({
      where: { username: { [Op.like]: keyword } },
      attributes: ["user_id", "username", "email"],
    }),
    Project.findAll({
      where: { title: { [Op.like]: keyword } },
      attributes: ["project_id", "title", "status"],
    }),
  ]);

  return {
    recruitments,
    users,
    projects,
  };
};

module.exports = {
  searchKeyword,
};
