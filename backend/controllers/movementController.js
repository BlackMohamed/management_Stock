const Movement = require('../models/Movement');

exports.getMovements = async (req, res) => {
  try {
    const movements = await Movement.find()
      .populate('productId', 'name')
      .populate('userId', 'username')
      .sort({ date: -1 });
    res.json(movements);
  } catch (err) {
    console.error('Error fetching movements:', err);
    res.status(500).json({ message: 'Server error' });
  }
};