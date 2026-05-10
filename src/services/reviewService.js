const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");

const sameId = (left, right) => Boolean(left && right && String(left) === String(right));

const makeReviewError = (message, status = 403, code = "FORBIDDEN") => {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
};

class ReviewService {
  async assertProjectParticipant(project_id, user_id, message = "프로젝트 멤버만 접근할 수 있습니다.") {
    if (!project_id || !user_id) {
      throw makeReviewError("프로젝트와 사용자 정보가 필요합니다.", 400, "INVALID_INPUT");
    }

    const participants = await sequelize.query(
      `SELECT 1
       FROM projects p
       WHERE p.project_id = :project_id AND p.user_id = :user_id
       UNION
       SELECT 1
       FROM project_members pm
       WHERE pm.project_id = :project_id AND pm.user_id = :user_id
       LIMIT 1`,
      {
        replacements: { project_id, user_id },
        type: QueryTypes.SELECT,
      }
    );

    if (!participants || participants.length === 0) {
      throw makeReviewError(message, 403, "FORBIDDEN");
    }
  }

  async createReview(data) {
    try {
      if (sameId(data.reviewer_id, data.reviewee_id)) {
        throw makeReviewError("본인은 평가할 수 없습니다.", 400, "SELF_REVIEW");
      }

      await this.assertProjectParticipant(
        data.project_id,
        data.reviewer_id,
        "프로젝트 멤버만 평가할 수 있습니다."
      );
      await this.assertProjectParticipant(
        data.project_id,
        data.reviewee_id,
        "같은 프로젝트 멤버만 평가할 수 있습니다."
      );

      const existingReviews = await sequelize.query(
        `SELECT review_id FROM reviews
         WHERE project_id = :project_id
           AND reviewer_id = :reviewer_id
           AND reviewee_id = :reviewee_id
         LIMIT 1`,
        {
          replacements: {
            project_id: data.project_id,
            reviewer_id: data.reviewer_id,
            reviewee_id: data.reviewee_id,
          },
          type: QueryTypes.SELECT,
        }
      );

      if (existingReviews.length > 0) {
        const error = new Error("이미 평가를 제출했습니다.");
        error.code = "DUPLICATE_REVIEW";
        throw error;
      }

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

  async getReviewsByUser(user_id, actor_user_id = user_id) {
    try {
      if (!sameId(user_id, actor_user_id)) {
        throw makeReviewError("본인의 리뷰만 조회할 수 있습니다.", 403, "FORBIDDEN");
      }

      // Raw SQL SELECT with JOIN
      const reviews = await sequelize.query(
        `SELECT
          r.*,
          u.username as reviewer_username
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

  async getReviewsByProject(project_id, actor_user_id) {
    try {
      await this.assertProjectParticipant(
        project_id,
        actor_user_id,
        "프로젝트 멤버만 리뷰를 조회할 수 있습니다."
      );

      // Raw SQL SELECT with multiple JOINs
      const reviews = await sequelize.query(
        `SELECT
          r.*,
          reviewer.username as reviewer_username,
          reviewee.username as reviewee_username
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

  async getReviewsByReviewer(project_id, reviewer_id, actor_user_id) {
    try {
      await this.assertProjectParticipant(
        project_id,
        actor_user_id,
        "프로젝트 멤버만 리뷰를 조회할 수 있습니다."
      );

      if (!sameId(reviewer_id, actor_user_id)) {
        throw makeReviewError("본인의 평가 제출 현황만 조회할 수 있습니다.", 403, "FORBIDDEN");
      }

      const reviews = await sequelize.query(
        `SELECT
          r.review_id,
          r.reviewee_id,
          u.username as reviewee_username,
          r.role_description,
          pm.task as reviewee_task,
          r.ability,
          r.effort,
          r.commitment,
          r.communication,
          r.reflection,
          r.overall_rating,
          r.comment,
          r.created_at
        FROM reviews r
        JOIN users u ON r.reviewee_id = u.user_id
        LEFT JOIN project_members pm
          ON pm.project_id = r.project_id AND pm.user_id = r.reviewee_id
        WHERE r.project_id = :project_id AND r.reviewer_id = :reviewer_id
        ORDER BY r.created_at DESC`,
        {
          replacements: { project_id, reviewer_id },
          type: QueryTypes.SELECT,
        }
      );

      return reviews;
    } catch (error) {
      console.error("🚨 getReviewsByReviewer Error:", error.message);
      throw error;
    }
  }

  async getProjectReviewSummary(project_id, actor_user_id) {
    try {
      await this.assertProjectParticipant(
        project_id,
        actor_user_id,
        "프로젝트 멤버만 리뷰 요약을 조회할 수 있습니다."
      );

      const summary = await sequelize.query(
        `SELECT
          COUNT(*) as total_reviews,
          AVG(overall_rating) as average_rating,
          AVG(ability) as avg_ability,
          AVG(effort) as avg_effort,
          AVG(commitment) as avg_commitment,
          AVG(communication) as avg_communication,
          AVG(reflection) as avg_reflection
        FROM reviews
        WHERE project_id = :project_id`,
        {
          replacements: { project_id },
          type: QueryTypes.SELECT,
        }
      );

      return summary[0];
    } catch (error) {
      console.error("🚨 getProjectReviewSummary Error:", error.message);
      throw error;
    }
  }
}

module.exports = new ReviewService();
