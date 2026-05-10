const { ProjectPost, User } = require("../models");
const { assertProjectMember } = require("../utils/projectAccess");

const makeError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createPost = async (user_id, project_id, title, content) => {
  await assertProjectMember(project_id, user_id);

  return await ProjectPost.create({
    project_id,
    user_id,
    title,
    content,
  });
};

const getPostsByProject = async (project_id, user_id) => {
  await assertProjectMember(project_id, user_id);

  return await ProjectPost.findAll({
    where: { project_id },
    include: [{ model: User, attributes: ["username", "profileImageUrl"] }],
    order: [["created_at", "DESC"]],
  });
};

const getPostById = async (post_id, user_id) => {
  const post = await ProjectPost.findByPk(post_id, {
    attributes: ["post_id", "project_id"],
  });
  if (!post) throw makeError("게시글을 찾을 수 없습니다.", 404);

  await assertProjectMember(post.project_id, user_id);

  const hydratedPost = await ProjectPost.findByPk(post_id, {
    include: [{ model: User, attributes: ["username", "profileImageUrl"] }],
  });
  if (!hydratedPost) throw makeError("게시글을 찾을 수 없습니다.", 404);

  return hydratedPost;
};

module.exports = { createPost, getPostsByProject, getPostById};
