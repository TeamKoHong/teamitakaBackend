const commentService = require("../services/commentService");
const { handleError } = require("../utils/errorHandler");

const getComments = async (req, res) => {
  try {
    const { recruitment_id } = req.params;
    const comments = await commentService.getComments(recruitment_id);
    res.status(200).json(comments);
  } catch (error) {
    handleError(res, error);
  }
};

const createComment = async (req, res) => {
  try {
    const { recruitment_id } = req.params;
    const { content } = req.body;
    const user_id = req.user.userId;

    const newComment = await commentService.createComment(user_id, recruitment_id, content);
    res.status(201).json(newComment);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getComments,
  createComment,
};
