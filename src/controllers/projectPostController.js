const projectPostService = require("../services/projectPostService");
const { handleError } = require("../utils/errorHandler");

const createPost = async (req, res) => {
  try {
    const { project_id } = req.params;
    const user_id = req.user.user_id;
    const { title, content } = req.body;

    // 제목과 내용이 없는 경우 400 에러 반환
    if (!title || !content) {
      return res.status(400).json({ error: "제목과 내용은 필수 항목입니다." });
    }

    // 게시물 생성
    const post = await projectPostService.createPost(user_id, project_id, title, content);

    // 생성된 게시물 반환
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
