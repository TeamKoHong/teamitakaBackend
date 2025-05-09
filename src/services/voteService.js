const { Vote, VoteOption, VoteResponse } = require('../models');

const createVote = async (project_id, data) => {
  // 투표 생성
  const vote = await Vote.create({
    project_id,
    title: data.title,
    description: data.description,
    start_date: data.start_date,
    end_date: data.end_date,
  });

  // 선택지 생성
  if (Array.isArray(data.options)) {
    const options = data.options.map(option_text => ({
      vote_id: vote.vote_id,
      option_text,
    }));
    await VoteOption.bulkCreate(options);
  }

  return vote;
};

const getVotesByProject = async (project_id) => {
  return await Vote.findAll({
    where: { project_id },
    include: [VoteOption],
  });
};

const getVoteById = async (voteId) => {
    return await Vote.findOne({
      where: { vote_id: voteId }, // ✅ 실제 모델에 있는 컬럼명으로 수정
      include: [VoteOption],
    });
  };
  
const submitVote = async (vote_id, data) => {
  return await VoteResponse.create({
    vote_id,
    option_id: data.option_id,
    user_id: data.user_id,
  });
};

module.exports = {
  createVote,
  getVotesByProject,
  getVoteById,
  submitVote,
};
