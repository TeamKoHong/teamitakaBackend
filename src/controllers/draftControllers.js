const draftRecruitmentService = require("../services/draftRecruitmentService");
const { handleError } = require("../utils/errorHandler");

const createDraftRecruitment = async (req, res) => {
  try {
    const user_id = res.locals.user.user_id;
    const draftRecruitment = await draftRecruitmentService.createDraftRecruitment(user_id, req.body);
    res.status(201).json({ message: "임시저장되었습니다.", draftRecruitment });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createDraftRecruitment,
};
