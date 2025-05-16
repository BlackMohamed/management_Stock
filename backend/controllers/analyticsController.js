const { sparkAnalytics } = require('../utils/spark');

exports.lowStock = async (req, res) => {
  try {
    const result = await sparkAnalytics('lowStock');
    res.json(result);
  } catch (err) {
    console.error('Error in lowStock analytics:', err.message, err.stack);
    res.status(500).json({ message: 'Analytics error', error: err.message });
  }
};

exports.topSellers = async (req, res) => {
  try {
    const result = await sparkAnalytics('topSellers');
    res.json(result);
  } catch (err) {
    console.error('Error in topSellers analytics:', err.message, err.stack);
    res.status(500).json({ message: 'Analytics error', error: err.message });
  }
};

exports.inactiveProducts = async (req, res) => {
  try {
    const result = await sparkAnalytics('inactiveProducts');
    res.json(result);
  } catch (err) {
    console.error('Error in inactiveProducts analytics:', err.message, err.stack);
    res.status(500).json({ message: 'Analytics error', error: err.message });
  }
};

exports.totalMovements = async (req, res) => {
  try {
    const result = await sparkAnalytics('totalMovements', { productId: req.params.productId });
    res.json(result);
  } catch (err) {
    console.error('Error in totalMovements analytics:', err.message, err.stack);
    res.status(500).json({ message: 'Analytics error', error: err.message });
  }
};

exports.recentAlerts = async (req, res) => {
  try {
    const result = await sparkAnalytics('recentAlerts');
    res.json(result);
  } catch (err) {
    console.error('Error in recentAlerts analytics:', err.message, err.stack);
    res.status(500).json({ message: 'Analytics error', error: err.message });
  }
};

exports.stockByCategory = async (req, res) => {
  try {
    const result = await sparkAnalytics('stockByCategory');
    res.json(result);
  } catch (err) {
    console.error('Error in stockByCategory analytics:', err.message, err.stack);
    res.status(500).json({ message: 'Analytics error', error: err.message });
  }
};

const Product = require('../models/Product');

exports.statistics = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalStock = await Product.aggregate([
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]).then(result => result[0]?.total || 0);
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lt: ['$quantity', '$minStockAlert'] }
    });
    const totalValue = await Product.aggregate([
      { $match: { price: { $exists: true, $ne: null, $type: ['double', 'decimal', 'int', 'long'] } } }, // Filter valid prices
      { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$price'] } } } }
    ]).then(result => result[0]?.total || 0);
    const categoryValues = await Product.aggregate([
      { $match: { price: { $exists: true, $ne: null, $type: ['double', 'decimal', 'int', 'long'] } } }, // Filter valid prices
      { $group: { _id: '$category', value: { $sum: { $multiply: ['$quantity', '$price'] } } } },
      { $project: { category: '$_id', value: 1, _id: 0 } }
    ]);

    res.json({
      totalProducts,
      totalStock,
      lowStockProducts,
      totalValue,
      categoryValues,
    });
  } catch (err) {
    console.error('Error fetching statistics:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};