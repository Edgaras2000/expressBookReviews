const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require("axios");
const public_users = express.Router();


public_users.post("/register", (req, res) => {

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Faltan datos"
    });
  }

  const user_exist = users.find(
    item => item.username === username
  );

  if (user_exist) {
    return res.status(409).json({
      message: "Usuario ya registrado"
    });
  }

  users.push({
    username,
    password
  });

  return res.status(201).json({
    message: "NUEVO Usuario registrado"
  });

});








public_users.get('/', async function (req, res) { // 10
  try {
    const getBooks = new Promise((resolve, reject) => {
      if (books) {
        resolve(books);
      } else {
        reject("No se encontraron libros disponibles");
      }
    });

    const all_books = await getBooks;
    return res.status(200).json(all_books);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});



public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const getBookByISBN = new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject("El libro no existe");
      }
    });

    const single_book = await getBookByISBN;
    return res.status(200).json(single_book);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});





public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const getBooksByAuthor = new Promise((resolve, reject) => {
      const filtered_books = Object.values(books).filter(item => item.author === author);
      if (filtered_books.length > 0) {
        resolve(filtered_books);
      } else {
        reject("No existen libros del autor");
      }
    });

    const books_from_author = await getBooksByAuthor;
    return res.status(200).json({ booksbyauthor: books_from_author });
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const getBooksByTitle = new Promise((resolve, reject) => {
      const filtered_books = Object.values(books).filter(item => item.title === title);
      if (filtered_books.length > 0) {
        resolve(filtered_books);
      } else {
        reject("No existen libros con ese título");
      }
    });

    const books_title = await getBooksByTitle;
    return res.status(200).json({ booksbytitle: books_title });
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});





//  Get book review
public_users.get('/review/:isbn', function (req, res) {

  let ISBN = req.params.isbn;

  let book = books[ISBN]

  if (!book) {
    return res.status(404).json({ message: "No se encontro el libro" })

  }


  return res.status(200).json({ data: book.reviews });
});










/////////////axios 




module.exports.general = public_users;
