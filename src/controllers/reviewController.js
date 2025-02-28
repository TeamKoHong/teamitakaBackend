const ReviewService = require("../services/reviewService");

exports.createReview = async (req, res) => {
  try {
    const { project_id, reviewer_id, reviewee_id, role_description, ability, effort, commitment, communication, reflection, overall_rating, comment } = req.body;

    if (![ability, effort, commitment, communication, reflection, overall_rating].every(score => score >= 1 && score <= 5)) {
      return res.status(400).json({ error: "All ratings must be between 1 and 5." });
    }

    const review = await ReviewService.createReview({
      project_id,
      reviewer_id,
      reviewee_id,
      role_description,
      ability,
      effort,
      commitment,
      communication,
      reflection,
      overall_rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await ReviewService.getReviewsByUser(req.params.user_id);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getProjectReviews = async (req, res) => {
  try {
    const reviews = await ReviewService.getReviewsByProject(req.params.project_id);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const deleted = await ReviewService.deleteReview(req.params.review_id, req.user.id);
    if (!deleted) return res.status(404).json({ error: "Review not found or unauthorized" });

    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
