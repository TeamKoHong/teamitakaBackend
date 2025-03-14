const express = require('express');
const router = express.Router();
const voteService = require('../services/voteService');

router.post('/create', async (req, res) => {
    try {
        const vote = await voteService.createVote(req.body);
        res.status(201).json(vote);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/project/:project_id', async (req, res) => {
    try {
        const votes = await voteService.getVotesByProject(req.params.project_id);
        res.status(200).json(votes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:voteId', async (req, res) => {
    try {
        const vote = await voteService.getVoteById(req.params.voteId);
        res.status(200).json(vote);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:voteId/submit', async (req, res) => {
    try {
        const response = await voteService.submitVote(req.params.voteId, req.body);
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

