// generateProducts.js
const fs = require('fs');

// Categories
const categories = ['Informatique', 'Accessoires', 'Bureautique', 'Réseau', 'Stockage'];

// Product name prefixes and suffixes for variety
const productPrefixes = [
  'Dell', 'HP', 'Samsung', 'Logitech', 'Corsair', 'TP-Link', 'Seagate', 'Asus', 'Acer', 'Lenovo',
  'Sony', 'Microsoft', 'Apple', 'Toshiba', 'Western Digital', 'Netgear', 'Epson', 'Canon', 'Brother', 'Razer'
];
const productTypes = [
  'Ordinateur portable', 'Écran', 'Souris', 'Clavier', 'Imprimante', 'Routeur', 'Disque dur', 'Switch',
  'Câble', 'Adaptateur', 'Casque', 'Webcam', 'Haut-parleur', 'Projecteur', 'Scanner', 'Serveur', 'UPS',
  'Tablette', 'Moniteur', 'Clé USB'
];

// Function to generate a random date between two dates
const getRandomDate = (start, end) => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
};

// Generate 1,000 products
const generateProducts = () => {
  const products = [];
  for (let i = 0; i < 1000; i++) {
    const prefix = productPrefixes[Math.floor(Math.random() * productPrefixes.length)];
    const type = productTypes[Math.floor(Math.random() * productTypes.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const quantity = Math.floor(Math.random() * 50); // Random quantity between 0 and 50
    const minStockAlert = Math.floor(Math.random() * 10) + 1; // Random minStockAlert between 1 and 10
    const price = (Math.random() * 5000 + 500).toFixed(2); // Random price between 500 and 5500 MAD
    const createdAt = getRandomDate(new Date('2024-01-01'), new Date('2025-05-15'));
    const updatedAt = getRandomDate(new Date(createdAt), new Date('2025-05-15'));

    products.push({
      name: `${prefix} ${type} ${i + 1}`,
      description: `${type} de marque ${prefix}, haute performance pour ${category.toLowerCase()}`,
      category,
      quantity,
      price: parseFloat(price),
      minStockAlert,
      createdAt,
      updatedAt,
    });
  }
  return products;
};

// Generate and save the products to a JSON file
const products = generateProducts();
fs.writeFileSync('products.json', JSON.stringify(products, null, 2), 'utf-8');
console.log('Generated 1,000 products and saved to products.json');