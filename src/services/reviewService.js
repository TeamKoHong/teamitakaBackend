const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");

class ReviewService {
  async createReview(data) {
    try {
      // Raw SQL INSERT
      const result = await sequelize.query(
        `INSERT INTO reviews (
          project_id, reviewer_id, reviewee_id, role_description,
          ability, effort, commitment, communication, reflection,
          overall_rating, comment, created_at, updated_at
        )
        VALUES (
          :project_id, :reviewer_id, :reviewee_id, :role_description,
          :ability, :effort, :commitment, :communication, :reflection,
          :overall_rating, :comment, NOW(), NOW()
        )
        RETURNING *`,
        {
          replacements: data,
          type: QueryTypes.INSERT,
        }
      );

      return result[0][0];
    } catch (error) {
      console.error("🚨 createReview Error:", error.message);
      throw error;
    }
  }

  async getReviewsByUser(user_id) {
    try {
      // Raw SQL SELECT with JOIN
      const reviews = await sequelize.query(
        `SELECT
          r.*,
          u.username as reviewer_username,
          u.email as reviewer_email
        FROM reviews r
        JOIN users u ON r.reviewer_id = u.user_id
        WHERE r.reviewee_id = :user_id
        ORDER BY r.created_at DESC`,
        {
          replacements: { user_id },
          type: QueryTypes.SELECT,
        }
      );

      return reviews;
    } catch (error) {
      console.error("🚨 getReviewsByUser Error:", error.message);
      throw error;
    }
  }

  async getReviewsByProject(project_id) {
    try {
      // Raw SQL SELECT with multiple JOINs
      const reviews = await sequelize.query(
        `SELECT
          r.*,
          reviewer.username as reviewer_username,
          reviewer.email as reviewer_email,
          reviewee.username as reviewee_username,
          reviewee.email as reviewee_email
        FROM reviews r
        JOIN users reviewer ON r.reviewer_id = reviewer.user_id
        JOIN users reviewee ON r.reviewee_id = reviewee.user_id
        WHERE r.project_id = :project_id
        ORDER BY r.created_at DESC`,
        {
          replacements: { project_id },
          type: QueryTypes.SELECT,
        }
      );

      return reviews;
    } catch (error) {
      console.error("🚨 getReviewsByProject Error:", error.message);
      throw error;
    }
  }

  async deleteReview(review_id, user_id) {
    try {
      // Raw SQL DELETE
      const result = await sequelize.query(
        `DELETE FROM reviews
         WHERE review_id = :review_id AND reviewer_id = :user_id
         RETURNING *`,
        {
          replacements: { review_id, user_id },
          type: QueryTypes.DELETE,
        }
      );

      return result[1].length > 0;
    } catch (error) {
      console.error("🚨 deleteReview Error:", error.message);
      throw error;
    }
  }
}

module.exports = new ReviewService();
