const supabase = require('../config/supabase');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Multer 메모리 스토리지 설정 (파일을 메모리에 임시 저장)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('허용되지 않는 파일 형식입니다. (jpeg, png, webp만 가능)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('image'); // 'image'는 프론트엔드에서 보내는 필드명

/**
 * POST /api/upload/recruitment-image
 * 모집공고 이미지 업로드
 */
const uploadRecruitmentImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `파일 업로드 오류: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '업로드할 이미지 파일이 없습니다.',
      });
    }

    try {
      if (!supabase) {
        return res.status(500).json({
          success: false,
          message: 'Supabase가 설정되지 않았습니다.',
        });
      }

      const file = req.file;
      const fileExt = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = `recruitments/${fileName}`;

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_STORAGE_BUCKET)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('❌ Supabase 업로드 실패:', error);
        return res.status(500).json({
          success: false,
          message: '이미지 업로드에 실패했습니다.',
          error: error.message,
        });
      }

      // 공개 URL 생성
      const { data: publicUrlData } = supabase.storage
        .from(process.env.SUPABASE_STORAGE_BUCKET)
        .getPublicUrl(filePath);

      const photoUrl = publicUrlData.publicUrl;

      console.log('✅ 이미지 업로드 성공:', photoUrl);

      res.status(200).json({
        success: true,
        message: '이미지 업로드 성공',
        data: {
          photo_url: photoUrl,
          file_path: filePath,
          file_name: fileName,
        },
      });
    } catch (error) {
      console.error('❌ 이미지 업로드 중 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 오류가 발생했습니다.',
        error: error.message,
      });
    }
  });
};

/**
 * POST /api/upload/profile-image
 * 프로필 이미지 업로드
 */
const uploadProfileImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `파일 업로드 오류: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '업로드할 이미지 파일이 없습니다.',
      });
    }

    try {
      if (!supabase) {
        return res.status(500).json({
          success: false,
          message: 'Supabase가 설정되지 않았습니다.',
        });
      }

      const file = req.file;
      const fileExt = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = `profiles/${fileName}`;

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_STORAGE_BUCKET)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('❌ Supabase 프로필 이미지 업로드 실패:', error);
        return res.status(500).json({
          success: false,
          message: '프로필 이미지 업로드에 실패했습니다.',
          error: error.message,
        });
      }

      // 공개 URL 생성
      const { data: publicUrlData } = supabase.storage
        .from(process.env.SUPABASE_STORAGE_BUCKET)
        .getPublicUrl(filePath);

      const photoUrl = publicUrlData.publicUrl;

      console.log('✅ 프로필 이미지 업로드 성공:', photoUrl);

      res.status(200).json({
        success: true,
        message: '프로필 이미지 업로드 성공',
        data: {
          photo_url: photoUrl,
          file_path: filePath,
          file_name: fileName,
        },
      });
    } catch (error) {
      console.error('❌ 프로필 이미지 업로드 중 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 오류가 발생했습니다.',
        error: error.message,
      });
    }
  });
};

module.exports = {
  uploadRecruitmentImage,
  uploadProfileImage,
};
