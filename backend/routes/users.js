const express = require('express');
const { getUsers, deleteUser, promoteUser } = require('../controllers/userController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, roleMiddleware(['admin']), getUsers);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteUser);
router.post('/promote', authMiddleware, roleMiddleware(['admin']), promoteUser);

module.exports = router;