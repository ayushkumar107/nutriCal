const express = require('express');
const { getWeeklyAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/analytics', protect, getWeeklyAnalytics);

module.exports = router;
