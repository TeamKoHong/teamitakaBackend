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
    res.status(200).json({ data: reviews });
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

exports.getReviewsByReviewer = async (req, res) => {
  try {
    const { project_id, reviewer_id } = req.params;
    const reviews = await ReviewService.getReviewsByReviewer(project_id, reviewer_id);
    res.status(200).json({ reviews });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getProjectReviewSummary = async (req, res) => {
  try {
    const { project_id } = req.params;
    const summaryData = await ReviewService.getProjectReviewSummary(project_id);

    // 카테고리별 평균값 파싱
    const avgAbility = parseFloat(summaryData.avg_ability) || 0;
    const avgEffort = parseFloat(summaryData.avg_effort) || 0;
    const avgCommitment = parseFloat(summaryData.avg_commitment) || 0;
    const avgCommunication = parseFloat(summaryData.avg_communication) || 0;
    const avgReflection = parseFloat(summaryData.avg_reflection) || 0;

    // 강점/개선점 자동 생성 (4.0 이상이면 강점, 3.5 미만이면 개선점)
    const strengths = [];
    const improvements = [];

    if (avgAbility >= 4.0) strengths.push('업무 능력이 뛰어나요');
    else if (avgAbility < 3.5 && avgAbility > 0) improvements.push('업무 능력 향상이 필요해요');

    if (avgEffort >= 4.0) strengths.push('노력을 많이 해요');
    else if (avgEffort < 3.5 && avgEffort > 0) improvements.push('더 많은 노력이 필요해요');

    if (avgCommitment >= 4.0) strengths.push('책임감이 강해요');
    else if (avgCommitment < 3.5 && avgCommitment > 0) improvements.push('책임감이 더 필요해요');

    if (avgCommunication >= 4.0) strengths.push('소통이 원활해요');
    else if (avgCommunication < 3.5 && avgCommunication > 0) improvements.push('소통이 더 원활하면 좋겠어요');

    if (avgReflection >= 4.0) strengths.push('성찰 능력이 뛰어나요');
    else if (avgReflection < 3.5 && avgReflection > 0) improvements.push('자기 성찰이 더 필요해요');

    res.status(200).json({
      averageRating: parseFloat(summaryData.average_rating) || 0,
      totalReviews: parseInt(summaryData.total_reviews) || 0,
      categoryAverages: {
        ability: avgAbility,
        effort: avgEffort,
        commitment: avgCommitment,
        communication: avgCommunication,
        reflection: avgReflection
      },
      summary: {
        strengths,
        improvements
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
