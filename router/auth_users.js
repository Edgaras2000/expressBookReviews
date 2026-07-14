const express = require('express');
const jwt = require('jsonwebtoken');

const authenticated = express.Router();
const SECRET = 'fingerprint_customer';

const users = [
  { username: 'admin', password: '123456' }
];

function generateToken(user) {
  return jwt.sign({ username: user.username }, SECRET, { expiresIn: '1h' });
}

authenticated.post('/auth/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
  }

  const exists = users.some((user) => user.username === username);
  if (exists) {
    return res.status(409).json({ message: 'El usuario ya existe' });
  }

  users.push({ username, password });
  return res.status(201).json({ message: 'Usuario registrado', user: { username } });
});

authenticated.post('/auth/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (item) => item.username === username && item.password === password
  );

  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const token = generateToken(user);

  return res.status(200).json({
    message: 'Login correcto',
    token
  });
});

authenticated.get('/auth/profile', (req, res) => {
  res.status(200).json({
    message: 'Perfil del cliente',
    user: req.user
  });
});

module.exports = { authenticated };
