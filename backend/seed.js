// backend/seed.js
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Movement = require('./models/Movement');
const Alert = require('./models/Alert');
const fs = require('fs');
require('dotenv').config();

// Read the generated products from products.json
const productsData = JSON.parse(fs.readFileSync('products.json', 'utf-8'));

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Movement.deleteMany({});
    await Alert.deleteMany({});

    // Seed Users
    const adminUser = await User.create({
      username: 'adminuser3',
      password: 'adminpass123', // This will be hashed by the pre-save hook
      role: 'admin',
    });

    const johnDoe = await User.create({
      username: 'gestionaire3',
      password: 'password123',
      role: 'gestionnaire',
    });

    // Seed Products (1,000 products from products.json)
    const createdProducts = await Product.insertMany(productsData);
    console.log(`Seeded ${createdProducts.length} products`);

    // Map product names to IDs for movements and alerts
    const productMap = createdProducts.reduce((acc, product) => {
      acc[product.name] = product._id;
      return acc;
    }, {});

    // Seed Stock Movements (generate 500 movements for variety)
    const movements = [];
    for (let i = 0; i < 500; i++) {
      const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const type = Math.random() > 0.5 ? 'entry' : 'exit';
      const quantity = Math.floor(Math.random() * 10) + 1; // Random quantity between 1 and 10
      const user = Math.random() > 0.5 ? adminUser : johnDoe;
      const date = new Date(
        new Date('2025-01-01').getTime() +
        Math.random() * (new Date('2025-05-15').getTime() - new Date('2025-01-01').getTime())
      );

      movements.push({
        productId: product._id,
        quantity,
        type,
        date,
        userId: user._id,
        userName: user.username,
      });
    }
    await Movement.insertMany(movements);
    console.log(`Seeded ${movements.length} movements`);

    // Seed Alerts (generate alerts for products with low stock)
    const alerts = [];
    for (const product of createdProducts) {
      if (product.quantity < product.minStockAlert) {
        alerts.push({
          productId: product._id,
          message: `Stock bas pour ${product.name}. Quantité actuelle: ${product.quantity}, Seuil minimum: ${product.minStockAlert}`,
          createdAt: new Date(),
          resolved: false,
        });
      }
    }
    await Alert.insertMany(alerts);
    console.log(`Seeded ${alerts.length} alerts`);

    console.log('Data seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();