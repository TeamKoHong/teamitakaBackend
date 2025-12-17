const draftService = require("../services/draftService");
const { handleError } = require("../utils/errorHandler");

const createDraftRecruitment = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const draftRecruitment = await draftService.createDraftRecruitment(user_id, req.body);
    res.status(201).json({ message: "임시저장되었습니다.", draftRecruitment });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createDraftRecruitment,
};
