const express = require('express');
const router = express.Router();
const { getAlerts, resolveAlert } = require('../controllers/alertController');
const { authMiddleware } = require('../middleware/auth');

// Ensure handlers are functions
console.log('getAlerts:', typeof getAlerts); // Should log "function"
console.log('resolveAlert:', typeof resolveAlert); // Should log "function"

router.get('/', authMiddleware, getAlerts);
router.put('/:id/resolve', authMiddleware, resolveAlert);

module.exports = router;