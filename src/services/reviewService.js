const { Review } = require("../models");

class ReviewService {
  async createReview(data) {
    return await Review.create(data);
  }

  async getReviewsByUser(user_id) {
    return await Review.findAll({
      where: { reviewee_id: user_id },
      include: [{ model: User, as: "Reviewer", attributes: ["name"] }],
    });
  }

  async getReviewsByProject(project_id) {
    return await Review.findAll({
      where: { project_id },
      include: [
        { model: User, as: "Reviewer", attributes: ["name"] },
        { model: User, as: "Reviewee", attributes: ["name"] },
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
