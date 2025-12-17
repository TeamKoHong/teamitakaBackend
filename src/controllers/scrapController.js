const scrapService = require("../services/scrapService");
const { handleError } = require("../utils/errorHandler");

const getUserScraps = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const data = await scrapService.getUserScraps(user_id);
    res.status(200).json({ data });
  } catch (error) {
    handleError(res, error);
  }
};

const toggleScrap = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { recruitment_id } = req.params;

    const message = await scrapService.toggleScrap(user_id, recruitment_id);
    res.status(200).send(message);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getUserScraps,
  toggleScrap,
};
