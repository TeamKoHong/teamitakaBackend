const express = require('express');
const router = express.Router();
const voteService = require('../services/voteService');

// ✅ [POST] 특정 프로젝트에 투표 생성
router.post('/projects/:project_id/votes', async (req, res) => {
    try {
        const vote = await voteService.createVote(req.params.project_id, req.body);
        res.status(201).json(vote);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ [GET] 특정 프로젝트의 모든 투표 조회
router.get('/projects/:project_id/votes', async (req, res) => {
    try {
        const votes = await voteService.getVotesByProject(req.params.project_id);
        res.status(200).json(votes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ [GET] 특정 투표 상세 조회
router.get('/projects/:project_id/votes/:vote_id', async (req, res) => {
    try {
        const vote = await voteService.getVoteById(req.params.vote_id);
        res.status(200).json(vote);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ [POST] 특정 투표에 응답 제출
router.post('/projects/:project_id/votes/:vote_id/submit', async (req, res) => {
    try {
        const response = await voteService.submitVote(req.params.vote_id, req.body);
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ [PUT] 특정 투표 수정
router.put('/projects/:project_id/votes/:vote_id', async (req, res) => {
    try {
        const updated = await voteService.updateVote(req.params.vote_id, req.body);
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ [DELETE] 특정 투표 삭제
router.delete('/projects/:project_id/votes/:vote_id', async (req, res) => {
    try {
        await voteService.deleteVote(req.params.vote_id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ [GET] 특정 투표의 응답 목록 조회
router.get('/projects/:project_id/votes/:vote_id/responses', async (req, res) => {
    try {
        const responses = await voteService.getVoteResponses(req.params.vote_id);
        res.status(200).json(responses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
