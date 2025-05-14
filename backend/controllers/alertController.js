// backend/controllers/alertController.js
const Alert = require('../models/Alert');

exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ resolved: false })
      .populate('productId', 'name quantity minStockAlert description')
      .sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { resolved: true },
      { new: true }
    );
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json({ message: 'Alert resolved' });
  } catch (err) {
    console.error('Error resolving alert:', err);
    res.status(500).json({ message: 'Server error' });
  }
};