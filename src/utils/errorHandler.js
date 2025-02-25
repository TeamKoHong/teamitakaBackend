// src/utils/errorHandler.js

const handleError = (res, error) => {
    console.error("❌ Error:", error.message); // 콘솔에 에러 로그 출력
  
    // 에러 상태 코드가 있으면 사용, 없으면 500으로 처리
    const statusCode = error.status || 500;
  
    res.status(statusCode).json({
      success: false,
      message: error.message || "서버 오류가 발생했습니다.",
    });
  };
  
  module.exports = { handleError };
  