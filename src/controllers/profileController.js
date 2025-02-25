const profileService = require("../services/profileService");
const { handleError } = require("../utils/errorHandler");

const getProfileByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const profile = await profileService.getProfileByUserId(user_id);
    res.json({ success: true, data: profile });
  } catch (error) {
    handleError(res, error);
  }
};

const createProfile = async (req, res) => {
  try {
    const user_id = res.locals.user.user_id;
    const profileData = req.body;
    const profile = await profileService.createProfile(user_id, profileData);
    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    handleError(res, error);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { profile_id } = req.params;
    const updates = req.body;
    const updatedProfile = await profileService.updateProfile(profile_id, updates);
    res.json({ success: true, message: "프로필이 수정되었습니다.", data: updatedProfile });
  } catch (error) {
    handleError(res, error);
  }
};

const deleteProfile = async (req, res) => {
  try {
    const { profile_id } = req.params;
    await profileService.deleteProfile(profile_id);
    res.json({ success: true, message: "프로필이 삭제되었습니다." });
  } catch (error) {
    handleError(res, error);
  }
};

const getResume = async (req, res) => {
  try {
    const { user_id } = req.params;
    const resume = await profileService.getResume(user_id);
    res.json({ success: true, data: resume });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getProfileByUserId,
  createProfile,
  updateProfile,
  deleteProfile,
  getResume,
};
