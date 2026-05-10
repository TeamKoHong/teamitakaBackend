const searchService = require("../services/searchService");
const { handleError } = require("../utils/errorHandler");

const search = async (req, res) => {
  try {
    const { q, type } = req.query;
    const keyword = String(q || "").trim();

    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: "INVALID_QUERY",
        message: "검색어를 입력해주세요.",
      });
    }

    if (type && !searchService.SEARCH_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_TYPE",
        message: "지원하지 않는 검색 타입입니다.",
      });
    }

    const results = await searchService.searchKeyword(keyword, { type });
    res.json(results);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  search,
};
