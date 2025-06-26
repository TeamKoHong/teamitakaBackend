const { Review, User } = require("../models");

class ReviewService {
  async createReview(data) {
    return await Review.create(data);
  }

  async getReviewsByUser(user_id) {
    return await Review.findAll({
      where: { reviewee_id: user_id },
      include: [{ model: User, as: "Reviewer", attributes: ["username"] }],
    });
  }

  async getReviewsByProject(project_id) {
    return await Review.findAll({
      where: { project_id },
      include: [
        { model: User, as: "Reviewer", attributes: ["username"] },
        { model: User, as: "Reviewee", attributes: ["username"] },
      ],
    });
  }

  async deleteReview(review_id, user_id) {
    return await Review.destroy({
      where: { review_id, reviewer_id: user_id },
    });
  }
}

module.exports = new ReviewService();
