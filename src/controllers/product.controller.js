const Product = require('../models/Product');
const AppError = require('../utils/AppError');

// GET /api/products
async function listProducts(_req, res) {
  const products = await Product.find({ active: true }).sort({ name: 1 });
  res.json({ ok: true, count: products.length, products });
}

// GET /api/products/:id
async function getProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError(404, 'Producto no encontrado');
  res.json({ ok: true, product });
}

// POST /api/products (admin)
async function createProduct(req, res) {
  const { name, description, price, stock, category } = req.body ?? {};
  const product = await Product.create({ name, description, price, stock, category });
  res.status(201).json({ ok: true, message: 'Producto creado', product });
}

// PUT /api/products/:id (admin)
async function updateProduct(req, res) {
  const { name, description, price, stock, category, active } = req.body ?? {};
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { name, description, price, stock, category, active },
    { returnDocument: 'after', runValidators: true }
  );
  if (!product) throw new AppError(404, 'Producto no encontrado');
  res.json({ ok: true, message: 'Producto actualizado', product });
}

module.exports = { listProducts, getProduct, createProduct, updateProduct };
