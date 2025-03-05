const projectPostService = require("../services/projectPostService");
const { handleError } = require("../utils/errorHandler");

const createPost = async (req, res) => {
  try {
    const { project_id } = req.params;
    const user_id = req.user.user_id;
    const { title, content } = req.body;

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
module.exports = { createPost, getPostsByProject, getPostById, updatePost, deletePost };
