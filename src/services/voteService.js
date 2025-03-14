const { Vote, VoteOption, VoteResponse } = require('../models/voteModel');

const createVote = async (data) => {
    return await Vote.create({
        project_id: data.project_id,
        title: data.title,
        description: data.description,
        start_date: data.start_date,
        end_date: data.end_date
    });
};

const getVotesByProject = async (project_id) => {
    return await Vote.findAll({ where: { project_id }, include: [VoteOption] });
};

const getVoteById = async (voteId) => {
    return await Vote.findOne({ where: { id: voteId }, include: [VoteOption] });
};

const submitVote = async (voteId, data) => {
    return await VoteResponse.create({
        vote_id: voteId,
        option_id: data.option_id,
        user_id: data.user_id
    });
};

module.exports = { createVote, getVotesByProject, getVoteById, submitVote };
