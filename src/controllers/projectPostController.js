const projectPostService = require("../services/projectPostService");
const { handleError } = require("../utils/errorHandler");

const createPost = async (req, res) => {
  try {
    const { project_id } = req.params;
    
    // req.admin 사용으로 변경
    if (!req.admin || !req.admin.user_id) {
      return res.status(401).json({ error: "인증된 관리자가 필요합니다." });
    }
    const user_id = req.admin.user_id; // req.user 대신 req.admin 사용

    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "제목과 내용은 필수 항목입니다." });
    }

    const post = await projectPostService.createPost(user_id, project_id, title, content);
    res.status(201).json(post);
  } catch (error) {
    handleError(res, error);
  }
};

const getPostsByProject = async (req, res) => {
  try {
    const { project_id } = req.params;
    const posts = await projectPostService.getPostsByProject(project_id);
    res.status(200).json(posts);
  } catch (error) {
    handleError(res, error);
  }
};

const getPostById = async (req, res) => {
  try {
    const { post_id } = req.params;
    const post = await projectPostService.getPostById(post_id);
    res.status(200).json(post);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { createPost, getPostsByProject, getPostById};
