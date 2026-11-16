const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// Verifica el JWT del header "Authorization: Bearer <token>" y carga el usuario en req.user
async function protect(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw new AppError(401, 'Token no proporcionado');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    throw new AppError(401, err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new AppError(401, 'El usuario del token ya no existe');
  req.user = user;
  next();
}

// Restringe la ruta a ciertos roles (se usa después de protect)
const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) throw new AppError(403, 'No tienes permisos para esta acción');
  next();
};

module.exports = { protect, authorize };
