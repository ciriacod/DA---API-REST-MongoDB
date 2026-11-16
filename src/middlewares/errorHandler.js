const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

function notFound(req, _res, next) {
  next(new AppError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

// Traduce cualquier error a una respuesta JSON uniforme { ok:false, message, errors? }
function errorHandler(err, _req, res, _next) {
  let status = err.statusCode || 500;
  let message = err.message;
  let errors;

  if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = 'Datos inválidos';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Valor inválido para ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    status = 409;
    message = `Ya existe un registro con ese ${Object.keys(err.keyValue || {}).join(', ')}`;
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'El cuerpo de la petición no es un JSON válido';
  }

  if (status === 500) {
    console.error(err);
    message = 'Error interno del servidor';
  }
  res.status(status).json({ ok: false, message, ...(errors && { errors }) });
}

module.exports = { notFound, errorHandler };
