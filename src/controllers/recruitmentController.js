const recruitmentService = require("../services/recruitmentService");
const { handleError } = require("../utils/errorHandler");

const getAllRecruitments = async (req, res) => {
  try {
    const recruitments = await recruitmentService.getAllRecruitmentsWithApplicationCount();
    res.status(200).json(recruitments);
  } catch (error) {
    handleError(res, error);
  }
};

const getRecruitmentById = async (req, res) => {
  try {
    const { recruitment_id } = req.params;
    const cookies = req.cookies || {};
    const recruitment = await recruitmentService.getRecruitmentById(
      recruitment_id,
      cookies,
      (name, value, options) => res.cookie(name, value, options)
    );
    if (!recruitment) return res.status(404).json({ message: "모집공고를 찾을 수 없습니다." });
    res.status(200).json(recruitment);
  } catch (error) {
    handleError(res, error);
  }
};

const createRecruitment = async (req, res) => {
  try {
    const { title, description, max_applicants, user_id, photo } = req.body;
    const newRecruitment = await recruitmentService.createRecruitment({
      title,
      description,
      max_applicants,
      user_id,
      photo,
    });
    res.status(201).json(newRecruitment);
  } catch (error) {
    handleError(res, error);
  }
};

const updateRecruitment = async (req, res) => {
  try {
    const { recruitment_id } = req.params;
    const updatedRecruitment = await recruitmentService.updateRecruitment(recruitment_id, req.body);
    res.status(200).json({ message: "모집공고가 수정되었습니다.", updatedRecruitment });
  } catch (error) {
    handleError(res, error);
  }
};

const deleteRecruitment = async (req, res) => {
  try {
    const { recruitment_id } = req.params;
    await recruitmentService.deleteRecruitment(recruitment_id);
    res.status(200).json({ message: "모집공고가 삭제되었습니다." });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getAllRecruitments,
  getRecruitmentById,
  createRecruitment,
  updateRecruitment,
  deleteRecruitment,
};
