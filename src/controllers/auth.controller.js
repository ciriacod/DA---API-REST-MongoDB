const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
  });
}

// POST /api/auth/register
async function register(req, res) {
  const { name, email, password } = req.body ?? {};
  // el rol no se acepta desde el cliente: todo registro público es "cliente"
  const user = await User.create({ name, email, password });
  res.status(201).json({ ok: true, message: 'Usuario registrado', user, token: signToken(user) });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body ?? {};
  if (!email || !password) throw new AppError(400, 'Correo y contraseña son obligatorios');

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  // mismo mensaje si el correo no existe o la contraseña es incorrecta
  if (!user || !(await user.comparePassword(password))) throw new AppError(401, 'Credenciales inválidas');

  res.json({ ok: true, message: 'Inicio de sesión exitoso', user, token: signToken(user) });
}

// GET /api/auth/me
function me(req, res) {
  res.json({ ok: true, user: req.user });
}

module.exports = { register, login, me };
