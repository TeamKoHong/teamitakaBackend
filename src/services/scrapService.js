const { Scrap, Recruitment } = require("../models");

const getUserScraps = async (user_id) => {
  return await Scrap.findAll({
    where: { user_id },
    raw: true,
    attributes: ["Recruitment.user_id", "Recruitment.title", "Recruitment.content", "Recruitment.scrap_cnt"],
    include: [{ model: Recruitment, attributes: [] }],
    order: [[Recruitment, "scrap_cnt", "desc"]],
  });
};

const toggleScrap = async (user_id, recruitment_id) => {
  const existScrap = await Scrap.findOne({
    where: { user_id, recruitment_id },
  });

  if (!existScrap) {
    await Scrap.create({ user_id, recruitment_id });
    await Recruitment.increment({ scrap_cnt: 1 }, { where: { recruitment_id } });
    return "스크랩 추가";
  } else {
    await Scrap.destroy({ where: { user_id, recruitment_id } });
    await Recruitment.decrement({ scrap_cnt: 1 }, { where: { recruitment_id } });
    return "스크랩 취소";
  }
};

module.exports = {
  getUserScraps,
  toggleScrap,
};
