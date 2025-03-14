const express = require('express');
const voteController = require('../controllers/voteController');
const router = express.Router();

router.use('/vote', voteController);

module.exports = router;
