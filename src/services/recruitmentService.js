const { Recruitment, Project, Hashtag } = require("../models");
const { Op } = require("sequelize");

const getAllRecruitments = async () => {
  return await Recruitment.findAll({ order: [["createdAt", "desc"]] });
};

const getRecruitmentById = async (req, res, recruitment_id) => {
  let viewedRecruitments = req.cookies.viewedRecruitments
    ? JSON.parse(req.cookies.viewedRecruitments)
    : [];

  if (!viewedRecruitments.includes(recruitment_id)) {
    await Recruitment.increment("views", { where: { recruitment_id } });
    viewedRecruitments.push(recruitment_id);
    res.cookie("viewedRecruitments", JSON.stringify(viewedRecruitments), {
      maxAge: 60 * 60 * 1000, // 1시간
      httpOnly: true,
    });
  }

  return await Recruitment.findByPk(recruitment_id, {
    include: [{ model: Hashtag, attributes: ["content"] }],
  });
};

const createRecruitment = async (req) => {
  const { title, description, status, start_date, end_date, hashtags, is_draft } = req.body;
  const user_id = req.user.user_id;

  const photoPath = req.file ? req.file.path : null;

  const recruitment = await Recruitment.create({
    title,
    description,
    status: is_draft ? "임시저장" : status,
    start_date,
    end_date,
    user_id,
    is_draft: is_draft || false,
    photo: photoPath,
  });

  if (hashtags && hashtags.length > 0) {
    const hashtagPromises = hashtags.map(tag =>
      Hashtag.findOrCreate({ where: { content: tag } })
    );
    const hashtagResults = await Promise.all(hashtagPromises);
    await recruitment.addHashtags(hashtagResults.map(([tag]) => tag));
  }

  return recruitment;
};

const updateRecruitment = async (req) => {
  const { recruitment_id } = req.params;
  const { title, description, status, start_date, end_date, hashtags } = req.body;

  const recruitment = await Recruitment.findByPk(recruitment_id);
  if (!recruitment) throw new Error("모집공고가 존재하지 않습니다.");

  if (status === "closed" && recruitment.status !== "closed") {
    const existingProject = await Project.findOne({ where: { recruitment_id } });
    if (!existingProject) {
      await Project.create({
        title: recruitment.title,
        description: recruitment.description,
        user_id: recruitment.user_id,
        recruitment_id: recruitment.recruitment_id,
      });
    }
  }

  await Recruitment.update({ title, description, status, start_date, end_date }, { where: { recruitment_id } });

  if (hashtags && hashtags.length > 0) {
    const hashtagPromises = hashtags.map(tag =>
      Hashtag.findOrCreate({ where: { content: tag } })
    );
    const hashtagResults = await Promise.all(hashtagPromises);
    await recruitment.setHashtags(hashtagResults.map(([tag]) => tag));
  }

  return recruitment;
};

const deleteRecruitment = async (req) => {
  const { recruitment_id } = req.params;

  const recruitment = await Recruitment.findByPk(recruitment_id);
  if (!recruitment) throw new Error("삭제할 모집공고가 없습니다.");

  await recruitment.setHashtags([]);
  await recruitment.destroy();
};

module.exports = {
  getAllRecruitments,
  getRecruitmentById,
  createRecruitment,
  updateRecruitment,
  deleteRecruitment,
};
