const express = require('express');
const { chatWithCoach } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, chatWithCoach);

module.exports = router;
