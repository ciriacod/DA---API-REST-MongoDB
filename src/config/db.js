const mongoose = require('mongoose');

async function connectDB(uri) {
  if (!uri) throw new Error('Falta la variable de entorno MONGODB_URI');
  await mongoose.connect(uri);
  console.log(`MongoDB conectado: ${mongoose.connection.name}`);
}

module.exports = connectDB;
