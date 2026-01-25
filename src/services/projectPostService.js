const { ProjectPost, Project, User } = require("../models");

const createPost = async (user_id, project_id, title, content) => {
  const project = await Project.findByPk(project_id);
  if (!project) throw new Error("프로젝트를 찾을 수 없습니다.");

  return await ProjectPost.create({
    project_id,
    user_id,
    title,
    content,
  });
};

const getPostsByProject = async (project_id) => {
  return await ProjectPost.findAll({
    where: { project_id },
    include: [{ model: User, attributes: ["username", "profileImageUrl"] }],
    order: [["created_at", "DESC"]],
  });
};

const getPostById = async (post_id) => {
  return await ProjectPost.findByPk(post_id, {
    include: [{ model: User, attributes: ["username", "profileImageUrl"] }],
  });
};

module.exports = { createPost, getPostsByProject, getPostById};
