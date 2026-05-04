const express = require('express');
const { logMeal, getTodayLog, deleteMeal } = require('../controllers/mealController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/log', protect, logMeal);
router.get('/today', protect, getTodayLog);
router.delete('/:mealId', protect, deleteMeal);

module.exports = router;
