// backend/seed.js
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Movement = require('./models/Movement');
const Alert = require('./models/Alert'); // Import the new Alert model
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Movement.deleteMany({});
    await Alert.deleteMany({}); // Clear existing alerts

    // Seed Users
    const adminUser = await User.create({
      username: 'adminuser',
      password: 'adminpass123',
      role: 'admin',
    });

    const johnDoe = await User.create({
      username: 'johndoe',
      password: 'password123',
      role: 'gestionnaire',
    });

    // Seed Products
    const products = [
      {
        name: 'Ordinateur portable Dell XPS 13',
        description: 'Processeur Intel Core i7, 16GB RAM, 512GB SSD',
        category: 'Informatique',
        price: 12999.99,
        quantity: 15,
        minStockAlert: 5,
        createdAt: '2025-01-15T10:30:00Z',
        updatedAt: '2025-03-20T14:25:00Z',
      },
      {
        name: 'Écran Samsung 27" 4K',
        description: 'Écran UHD 3840x2160, 60Hz, HDR',
        category: 'Informatique',
        price: 3499.99,
        quantity: 23,
        minStockAlert: 8,
        createdAt: '2025-01-20T11:45:00Z',
        updatedAt: '2025-03-18T09:15:00Z',
      },
      {
        name: 'Souris sans fil Logitech MX Master',
        description: 'Connexion Bluetooth, capteur laser haute précision',
        category: 'Accessoires',
        price: 899.99,
        quantity: 4,
        minStockAlert: 10,
        createdAt: '2025-02-05T15:20:00Z',
        updatedAt: '2025-03-22T16:40:00Z',
      },
      {
        name: 'Clavier mécanique Corsair K70',
        description: 'Switches Cherry MX, rétroéclairage RGB',
        category: 'Accessoires',
        price: 1299.99,
        quantity: 8,
        minStockAlert: 5,
        createdAt: '2025-02-10T13:10:00Z',
        updatedAt: '2025-03-15T11:30:00Z',
      },
      {
        name: 'Imprimante HP LaserJet Pro',
        description: 'Impression laser N&B, 30 ppm',
        category: 'Bureautique',
        price: 1999.99,
        quantity: 2,
        minStockAlert: 3,
        createdAt: '2025-02-15T09:50:00Z',
        updatedAt: '2025-03-21T14:05:00Z',
      },
      {
        name: 'Routeur Wi-Fi 6 TP-Link',
        description: 'Wi-Fi 6, double bande, 4 ports Ethernet',
        category: 'Réseau',
        price: 1499.99,
        quantity: 6,
        minStockAlert: 5,
        createdAt: '2025-02-20T16:30:00Z',
        updatedAt: '2025-03-19T10:20:00Z',
      },
      {
        name: 'Disque dur externe 2TB Seagate',
        description: 'USB 3.0, compatible Windows et Mac',
        category: 'Stockage',
        price: 799.99,
        quantity: 12,
        minStockAlert: 7,
        createdAt: '2025-02-25T14:15:00Z',
        updatedAt: '2025-03-17T13:45:00Z',
      },
    ];

    const createdProducts = await Product.insertMany(products);

    // Generate Alerts for Low-Stock Products
    const alerts = [];
    for (const product of createdProducts) {
      if (product.quantity < product.minStockAlert) {
        alerts.push({
          productId: product._id,
          message: `Stock bas pour ${product.name}. Quantité actuelle: ${product.quantity}, Seuil minimum: ${product.minStockAlert}`,
          createdAt: new Date('2025-03-22T16:45:00Z'),
          resolved: false,
        });
      }
    }
    await Alert.insertMany(alerts);
    console.log(`Seeded ${alerts.length} alerts`);

    // Map product names to IDs for movements
    const productMap = createdProducts.reduce((acc, product) => {
      acc[product.name] = product._id;
      return acc;
    }, {});

    // Seed Stock Movements
    const movements = [
      {
        productId: productMap['Ordinateur portable Dell XPS 13'],
        quantity: 5,
        type: 'entry',
        createdAt: '2025-03-01T10:15:00Z',
        userId: adminUser._id,
      },
      {
        productId: productMap['Ordinateur portable Dell XPS 13'],
        quantity: 2,
        type: 'exit',
        createdAt: '2025-03-05T14:30:00Z',
        userId: johnDoe._id,
      },
      {
        productId: productMap['Souris sans fil Logitech MX Master'],
        quantity: 3,
        type: 'exit',
        createdAt: '2025-03-10T09:45:00Z',
        userId: johnDoe._id,
      },
      {
        productId: productMap['Imprimante HP LaserJet Pro'],
        quantity: 1,
        type: 'exit',
        createdAt: '2025-03-12T11:20:00Z',
        userId: adminUser._id,
      },
      {
        productId: productMap['Écran Samsung 27" 4K'],
        quantity: 8,
        type: 'entry',
        createdAt: '2025-03-15T16:10:00Z',
        userId: adminUser._id,
      },
      {
        productId: productMap['Disque dur externe 2TB Seagate'],
        quantity: 4,
        type: 'entry',
        createdAt: '2025-03-18T13:40:00Z',
        userId: johnDoe._id,
      },
      {
        productId: productMap['Routeur Wi-Fi 6 TP-Link'],
        quantity: 2,
        type: 'exit',
        createdAt: '2025-03-20T15:25:00Z',
        userId: adminUser._id,
      },
    ];

    await Movement.insertMany(movements);

    console.log('Data seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();