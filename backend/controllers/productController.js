// backend/controllers/productController.js
const Product = require('../models/Product');
const Alert = require('../models/Alert');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().select('-__v');
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $match: {
          $expr: { $lt: ['$quantity', '$minStockAlert'] },
        },
      },
      {
        $project: {
          __v: 0,
        },
      },
    ]);
    res.json(products);
  } catch (err) {
    console.error('Error fetching low stock products:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, category, price, quantity, minStockAlert } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (minStockAlert !== undefined) updateData.minStockAlert = parseInt(minStockAlert);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });

    console.log('Updated product:', product);
    await manageAlerts(product);

    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(400).json({ message: err.message || 'Erreur lors de la mise à jour' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, price, quantity, minStockAlert } = req.body;
    const product = new Product({
      name,
      description,
      category,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      minStockAlert: parseInt(minStockAlert),
    });
    const savedProduct = await product.save();

    await manageAlerts(savedProduct);

    res.status(201).json(savedProduct);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(400).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await Alert.updateMany({ productId: product._id, resolved: false }, { resolved: true });

    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to manage alerts
const manageAlerts = async (product) => {
  try {
    console.log(`Managing alerts for product: ${product.name}, quantity: ${product.quantity}, minStockAlert: ${product.minStockAlert}`);
    const existingAlert = await Alert.findOne({ productId: product._id, resolved: false });
    console.log('Existing alert:', existingAlert);

    if (product.quantity < product.minStockAlert) {
      if (!existingAlert) {
        const newAlert = await Alert.create({
          productId: product._id,
          message: `Stock bas pour ${product.name}. Quantité actuelle: ${product.quantity}, Seuil minimum: ${product.minStockAlert}`,
        });
        console.log('Created new alert:', newAlert);
      } else {
        console.log('Alert already exists, skipping creation.');
      }
    } else {
      if (existingAlert) {
        await Alert.updateOne({ _id: existingAlert._id }, { resolved: true });
        console.log(`Resolved alert for product: ${product.name}`);
      } else {
        console.log('No alert to resolve.');
      }
    }
  } catch (err) {
    console.error('Error managing alerts:', err);
  }
};