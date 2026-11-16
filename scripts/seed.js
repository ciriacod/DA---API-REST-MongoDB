// Crea un administrador y productos de ejemplo. Uso: npm run seed
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Product = require('../src/models/Product');

const ADMIN = {
  name: 'Administrador',
  email: process.env.SEED_ADMIN_EMAIL || 'admin@tienda.test',
  password: process.env.SEED_ADMIN_PASSWORD || 'Admin12345',
  role: 'admin',
};

const PRODUCTS = [
  { name: 'Teclado mecánico', description: 'Switches rojos, retroiluminado', price: 189.9, stock: 15, category: 'perifericos' },
  { name: 'Mouse inalámbrico', description: '2.4 GHz, 1600 DPI', price: 59.5, stock: 30, category: 'perifericos' },
  { name: 'Monitor 24"', description: 'IPS Full HD 75 Hz', price: 649, stock: 8, category: 'monitores' },
];

(async () => {
  await connectDB(process.env.MONGODB_URI);
  await Promise.all([User.deleteMany({}), Product.deleteMany({}), mongoose.connection.collection('orders').deleteMany({})]);
  await User.create(ADMIN);
  const products = await Product.insertMany(PRODUCTS);
  console.log(`Admin: ${ADMIN.email}`);
  products.forEach((p) => console.log(`${p.id}  ${p.name}  stock=${p.stock}`));
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
