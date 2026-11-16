// Error de negocio con código HTTP; lo traduce el middleware errorHandler.
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
