const express = require('express');
const { lowStock, topSellers, inactiveProducts, totalMovements, recentAlerts, stockByCategory } = require('../controllers/analyticsController');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.get('/low-stock', authMiddleware, lowStock);
router.get('/top-sellers', authMiddleware, topSellers);
router.get('/inactive-products', authMiddleware, inactiveProducts);
router.get('/total-movements/:productId', authMiddleware, totalMovements);
router.get('/recent-alerts', authMiddleware, recentAlerts);
router.get('/stock-by-category', authMiddleware, stockByCategory);

module.exports = router;