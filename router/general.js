const express = require('express');
const jwt = require('jsonwebtoken');

const general = express.Router();
const SECRET = 'fingerprint_customer';

const books = [
  {
    id: 1,
    isbn: '978-0-306-40615-7',
    title: 'El Principito',
    author: 'Antoine de Saint-Exupéry',
    description: 'Novela corta y filosófica.',
    reviews: []
  },
  {
    id: 2,
    isbn: '978-0-452-28423-4',
    title: '1984',
    author: 'George Orwell',
    description: 'Novela distópica clásica.',
    reviews: []
  },
  {
    id: 3,
    isbn: '978-84-206-6189-5',
    title: 'Don Quijote',
    author: 'Miguel de Cervantes',
    description: 'Clásico de la literatura española.',
    reviews: []
  }
];

general.get('/', (req, res) => {
  res.status(200).json({
    message: 'Ruta pública'
  });
});

general.get('/books', (req, res) => {
  res.status(200).json(books);
});

general.get('/books/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase();

  const results = books.filter((book) => {
    return (
      book.isbn.toLowerCase().includes(q) ||
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q)
    );
  });

  res.status(200).json(results);
});

general.get('/books/:isbn', (req, res) => {
  const book = books.find((item) => item.isbn === req.params.isbn);
  if (!book) {
    return res.status(404).json({ message: 'Libro no encontrado' });
  }

  return res.status(200).json(book);
});

general.get('/books/:isbn/reviews', (req, res) => {
  const book = books.find((item) => item.isbn === req.params.isbn);
  if (!book) {
    return res.status(404).json({ message: 'Libro no encontrado' });
  }

  return res.status(200).json(book.reviews);
});

general.post('/books/:isbn/reviews', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Debes iniciar sesión para reseñar' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }

  const book = books.find((item) => item.isbn === req.params.isbn);
  if (!book) {
    return res.status(404).json({ message: 'Libro no encontrado' });
  }

  const { comment } = req.body;
  if (!comment) {
    return res.status(400).json({ message: 'El comentario es obligatorio' });
  }

  const review = {
    id: Date.now().toString(),
    username: req.user.username,
    comment
  };

  book.reviews.push(review);
  return res.status(201).json(review);
});

general.put('/books/:isbn/reviews/:reviewId', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Debes iniciar sesión para modificar reseñas' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }

  const book = books.find((item) => item.isbn === req.params.isbn);
  if (!book) {
    return res.status(404).json({ message: 'Libro no encontrado' });
  }

  const review = book.reviews.find((item) => item.id === req.params.reviewId);
  if (!review) {
    return res.status(404).json({ message: 'Reseña no encontrada' });
  }

  if (review.username !== req.user.username) {
    return res.status(403).json({ message: 'Solo puedes modificar tus propias reseñas' });
  }

  review.comment = req.body.comment || review.comment;
  return res.status(200).json(review);
});

general.delete('/books/:isbn/reviews/:reviewId', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Debes iniciar sesión para eliminar reseñas' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }

  const book = books.find((item) => item.isbn === req.params.isbn);
  if (!book) {
    return res.status(404).json({ message: 'Libro no encontrado' });
  }

  const reviewIndex = book.reviews.findIndex((item) => item.id === req.params.reviewId);
  if (reviewIndex === -1) {
    return res.status(404).json({ message: 'Reseña no encontrada' });
  }

  const review = book.reviews[reviewIndex];
  if (review.username !== req.user.username) {
    return res.status(403).json({ message: 'Solo puedes eliminar tus propias reseñas' });
  }

  book.reviews.splice(reviewIndex, 1);
  return res.status(200).json({ message: 'Reseña eliminada' });
});

module.exports = { general };
