// src/middlewares/uploadMiddleware.js
const multer = require("multer");

// 저장 위치 및 파일명 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");  // 업로드 폴더 지정 (프로젝트 루트에 생성)
  },
  filename: function (req, file, cb) {
    // 고유한 파일명 생성
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// 파일 필터링 (예: 이미지 파일만 허용)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("이미지 파일만 업로드 가능합니다."), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
