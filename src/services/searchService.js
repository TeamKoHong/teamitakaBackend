const { Op } = require("sequelize");
const { Recruitment, Project, User, Hashtag } = require("../models");

const SEARCH_TYPES = ["recruitment", "project", "user"];

const toPlain = (record) => (record?.toJSON ? record.toJSON() : record);

const buildLike = (keyword) => `%${String(keyword).trim()}%`;

const searchRecruitments = async (keyword, limit) => {
  const like = buildLike(keyword);

  const rows = await Recruitment.findAll({
    where: {
      [Op.or]: [
        { title: { [Op.like]: like } },
        { description: { [Op.like]: like } },
        { "$Hashtags.name$": { [Op.like]: like } },
      ],
    },
    attributes: [
      "recruitment_id",
      "title",
      "description",
      "status",
      "photo_url",
      "project_type",
      "created_at",
    ],
    include: [{
      model: Hashtag,
      attributes: ["name"],
      through: { attributes: [] },
      required: false,
    }],
    order: [["created_at", "DESC"]],
    limit,
    subQuery: false,
  });

  return rows.map(toPlain);
};

const searchProjects = async (keyword, limit) => {
  const like = buildLike(keyword);

  const rows = await Project.findAll({
    where: {
      [Op.or]: [
        { title: { [Op.like]: like } },
        { description: { [Op.like]: like } },
      ],
    },
    attributes: [
      "project_id",
      "title",
      "description",
      "status",
      "project_type",
      "created_at",
    ],
    order: [["created_at", "DESC"]],
    limit,
  });

  return rows.map(toPlain);
};

const searchUsers = async (keyword, limit) => {
  const like = buildLike(keyword);

  const rows = await User.findAll({
    where: {
      [Op.or]: [
        { username: { [Op.like]: like } },
        { name: { [Op.like]: like } },
        { university: { [Op.like]: like } },
        { major: { [Op.like]: like } },
        { skills: { [Op.like]: like } },
      ],
    },
    attributes: ["user_id", "username", "name", "avatar", "university", "major"],
    order: [["username", "ASC"]],
    limit,
  });

  return rows.map(toPlain);
};

const searchKeyword = async (keyword, { type, limit = 20 } = {}) => {
  const targetTypes = type ? [type] : SEARCH_TYPES;
  const results = {
    recruitments: [],
    projects: [],
    users: [],
  };

  if (targetTypes.includes("recruitment")) {
    results.recruitments = await searchRecruitments(keyword, limit);
  }

  if (targetTypes.includes("project")) {
    results.projects = await searchProjects(keyword, limit);
  }

  if (targetTypes.includes("user")) {
    results.users = await searchUsers(keyword, limit);
  }

  const total = results.recruitments.length + results.projects.length + results.users.length;

  return {
    success: true,
    message: total > 0 ? "검색 결과입니다" : "검색 결과가 없습니다",
    data: {
      ...results,
      total,
    },
  };
};

module.exports = {
  SEARCH_TYPES,
  searchKeyword,
};
