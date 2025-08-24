const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { simpleRateLimit } = require('../middlewares/rateLimitMiddleware');

router.post('/send', simpleRateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), emailController.send);
router.post('/verify', simpleRateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), emailController.verify);

module.exports = router;


