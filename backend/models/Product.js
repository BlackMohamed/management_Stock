const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String }, // Added
  category: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  price: { type: Number }, // Added
  minStockAlert: { type: Number, required: true, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);