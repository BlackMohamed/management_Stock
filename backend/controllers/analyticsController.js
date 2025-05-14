const { sparkAnalytics } = require('../utils/spark');

exports.lowStock = async (req, res) => {
  try {
    const result = await sparkAnalytics('lowStock');
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Analytics error' });
  }
};

exports.topSellers = async (req, res) => {
  try {
    const result = await sparkAnalytics('topSellers');
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Analytics error' });
  }
};

exports.inactiveProducts = async (req, res) => {
  try {
    const result = await sparkAnalytics('inactiveProducts');
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Analytics error' });
  }
};

exports.totalMovements = async (req, res) => {
  try {
    const result = await sparkAnalytics('totalMovements', { productId: req.params.productId });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Analytics error' });
  }
};

exports.recentAlerts = async (req, res) => {
  try {
    const result = await sparkAnalytics('recentAlerts');
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Analytics error' });
  }
};

exports.stockByCategory = async (req, res) => {
  try {
    const result = await sparkAnalytics('stockByCategory');
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Analytics error' });
  }
};
