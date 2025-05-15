const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  currentStock: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 0 },
  price: { type: Number },
  minStockAlert: { type: Number, required: true, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);