
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { authenticated } = require('./router/auth_users.js');
const { general } = require('./router/general.js');

const app = express();
const SECRET = 'fingerprint_customer';
const PORT = 5000;

app.use(express.json());
app.use('/customer', session({
  secret: SECRET,
  resave: true,
  saveUninitialized: true
}));

app.use('/customer/auth', function auth(req, res, next) {
  const url = req.originalUrl || req.url;

  if (url.includes('/auth/login') || url.includes('/auth/register')) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
});

app.use('/customer', authenticated);
app.use('/', general);

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

module.exports = { app };