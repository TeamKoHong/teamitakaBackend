const { Scrap, Recruitment, User, sequelize } = require("../models");
const { Op } = require("sequelize");

const getUserScraps = async (user_id) => {
  const scraps = await Scrap.findAll({
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
        ['recruitment_start', 'start_date'],
        ['recruitment_end', 'deadline'],
        'project_type',
        'created_at',
        [
          sequelize.literal(`(
            SELECT COUNT(*) FROM scraps
            WHERE scraps.recruitment_id = "Recruitment".recruitment_id
          )`),
          'scrap_count'
        ]
      ],
      include: [{
        model: User,
        attributes: ['university']
      }]
    }],
    order: [['createdAt', 'DESC']],
  });

  // 응답 평탄화: Recruitment 데이터를 최상위로 병합
  return scraps.map(scrap => {
    const plain = scrap.get({ plain: true });
    const recruitment = plain.Recruitment || {};
    const { User: recruitmentUser, ...recruitmentData } = recruitment;
    return {
      scrap_id: plain.scrap_id,
      recruitment_id: plain.recruitment_id,
      ...recruitmentData,
      university: recruitmentUser?.university || null,
    };
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
        scrap_count: { [Op.gt]: 0 }
      }
    });
    return "스크랩 취소";
  }
};

module.exports = {
  getUserScraps,
  toggleScrap,
};
