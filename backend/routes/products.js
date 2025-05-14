const express = require('express');
const router = express.Router();
const {
  getProducts,
  getLowStockProducts,
  updateProduct,
  createProduct,
  deleteProduct,
} = require('../controllers/productController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, getProducts);
router.get('/low-stock', authMiddleware, getLowStockProducts);
router.put('/:id', authMiddleware, updateProduct);
router.post('/', authMiddleware, createProduct);
router.delete('/:id', authMiddleware, deleteProduct);

module.exports = router;