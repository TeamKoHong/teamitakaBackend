const { Scrap, Recruitment, sequelize } = require("../models");

const getUserScraps = async (user_id) => {
  return await Scrap.findAll({
    where: { user_id },
    include: [{
      model: Recruitment,
      attributes: [
        'recruitment_id',
        'user_id',
        'title',
        'description',
        'status',
        'photo_url',
        [
          sequelize.literal(`(
            SELECT COUNT(*) FROM scraps
            WHERE scraps.recruitment_id = "Recruitment".recruitment_id
          )`),
          'scrap_count'
        ]
      ]
    }],
    order: [['createdAt', 'DESC']],
  });
};

const toggleScrap = async (user_id, recruitment_id) => {
  const existScrap = await Scrap.findOne({
    where: { user_id, recruitment_id },
  });

  if (!existScrap) {
    await Scrap.create({ user_id, recruitment_id });
    await Recruitment.increment('scrap_count', { where: { recruitment_id } });
    return "스크랩 추가";
  } else {
    await Scrap.destroy({ where: { user_id, recruitment_id } });
    await Recruitment.decrement('scrap_count', {
      where: {
        recruitment_id,
        scrap_count: { [sequelize.Op.gt]: 0 }
      }
    });
    return "스크랩 취소";
  }
};

module.exports = {
  getUserScraps,
  toggleScrap,
};
