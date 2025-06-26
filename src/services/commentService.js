const { Comment, User } = require("../models");

const getComments = async (recruitment_id) => {
  return await Comment.findAll({
    where: { recruitment_id },
    include: [
      { 
        model: User, 
        attributes: ["username", "avatar"],
        as: "User"
      }
    ],
    order: [["createdAt", "ASC"]]
  });
};

const createComment = async (user_id, recruitment_id, content) => {
  return await Comment.create({
    user_id,
    recruitment_id,
    content
  });
};

module.exports = {
  getComments,
  createComment,
}; 