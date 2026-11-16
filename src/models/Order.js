const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true }, // copia del nombre al momento de comprar
    quantity: {
      type: Number,
      required: true,
      min: [1, 'La cantidad mínima es 1'],
      validate: { validator: Number.isInteger, message: 'La cantidad debe ser un número entero' },
    },
    unitPrice: { type: Number, required: true, min: 0 }, // precio congelado al comprar
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: {
      type: [orderItemSchema],
      validate: { validator: (v) => v.length > 0, message: 'La orden debe tener al menos un producto' },
    },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: { values: ['completada', 'devuelta'], message: 'Estado no permitido' },
      default: 'completada',
    },
    returnedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Order', orderSchema);
