const express = require('express');
const router = express.Router();
const { getMovements } = require('../controllers/movementController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, getMovements);

module.exports = router;