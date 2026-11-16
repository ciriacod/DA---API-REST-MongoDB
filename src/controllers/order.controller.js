const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');

// Valida el cuerpo y une líneas repetidas del mismo producto
function parseItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError(400, 'Debes enviar "items" con al menos un producto');
  }
  const merged = new Map();
  for (const it of items) {
    const { product, quantity } = it ?? {};
    if (!mongoose.isValidObjectId(product)) throw new AppError(400, `Id de producto inválido: ${product}`);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new AppError(400, 'La cantidad de cada producto debe ser un entero mayor o igual a 1');
    }
    merged.set(String(product), (merged.get(String(product)) || 0) + quantity);
  }
  return [...merged].map(([product, quantity]) => ({ product, quantity }));
}

// POST /api/orders  — compra: descuenta stock y crea la orden en una sola transacción
async function createOrder(req, res) {
  const items = parseItems(req.body?.items);
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      const lines = [];
      let total = 0;
      for (const { product, quantity } of items) {
        // descuento atómico: solo actualiza si hay stock suficiente
        const p = await Product.findOneAndUpdate(
          { _id: product, active: true, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { returnDocument: 'after', session }
        );
        if (!p) {
          const exists = await Product.findById(product).session(session);
          if (!exists || !exists.active) throw new AppError(404, `Producto no encontrado: ${product}`);
          throw new AppError(409, `Stock insuficiente para "${exists.name}" (disponible: ${exists.stock}, solicitado: ${quantity})`);
        }
        lines.push({ product: p._id, name: p.name, quantity, unitPrice: p.price });
        total += p.price * quantity;
      }
      [order] = await Order.create(
        [{ user: req.user._id, items: lines, total: Math.round(total * 100) / 100 }],
        { session }
      );
    });
  } finally {
    await session.endSession();
  }
  res.status(201).json({ ok: true, message: 'Orden creada', order });
}

// GET /api/orders — el cliente ve sus órdenes; el admin ve todas
async function listOrders(req, res) {
  const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json({ ok: true, count: orders.length, orders });
}

// GET /api/orders/:id
async function getOrder(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order || (req.user.role !== 'admin' && !order.user.equals(req.user._id))) {
    throw new AppError(404, 'Orden no encontrada');
  }
  res.json({ ok: true, order });
}

// PATCH /api/orders/:id/return — devolución: restaura el stock y marca la orden como devuelta
async function returnOrder(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(400, 'Id de orden inválido');
  const owner = req.user.role === 'admin' ? {} : { user: req.user._id };
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      // el cambio de estado es atómico: una orden no se puede devolver dos veces
      order = await Order.findOneAndUpdate(
        { _id: req.params.id, status: 'completada', ...owner },
        { status: 'devuelta', returnedAt: new Date() },
        { returnDocument: 'after', session }
      );
      if (!order) {
        const exists = await Order.findOne({ _id: req.params.id, ...owner }).session(session);
        if (!exists) throw new AppError(404, 'Orden no encontrada');
        throw new AppError(400, 'La orden ya fue devuelta');
      }
      for (const it of order.items) {
        await Product.updateOne({ _id: it.product }, { $inc: { stock: it.quantity } }, { session });
      }
    });
  } finally {
    await session.endSession();
  }
  res.json({ ok: true, message: 'Orden devuelta y stock restaurado', order });
}

module.exports = { createOrder, listOrders, getOrder, returnOrder };
