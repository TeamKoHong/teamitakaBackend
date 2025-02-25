const handleError = (res, error) => {
    console.error(error);
    res.status(500).json({ message: error.message || "서버 오류가 발생했습니다." });
  };
  
  module.exports = { handleError };
  