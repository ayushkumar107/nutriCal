const express = require('express');
const { getBarcodeDetails, analyzeImage } = require('../controllers/foodController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/barcode/:barcode', protect, getBarcodeDetails);
router.post('/analyze-image', protect, analyzeImage);

module.exports = router;
