const searchService = require("../services/searchService");
const { handleError } = require("../utils/errorHandler");

const search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "검색어를 입력해주세요." });
    }

    const results = await searchService.searchKeyword(q);
    res.json(results);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  search,
};
