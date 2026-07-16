const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();

let users = [];



const isValid = (username) => {
  return users.some(
    user => user.username === username
  );
};



const authenticatedUser = (username, password) => {

  return users.some(
    user => 
      user.username === username &&
      user.password === password
  );

};




regd_users.post("/login", (req, res) => {

  const { username, password } = req.body;


  
  if (!username || !password) {
    return res.status(400).json({
      message: "Username y password son requeridos"
    });
  }


  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: "Usuario o contraseña incorrectos"
    });
  }


  const user = users.find(
    item => item.username === username
  );


  const new_token = jwt.sign(
    { id: user.id,username: user.username},"CACA",{expiresIn: "5h"}
  );


  req.session.authorization = {
    accessToken: new_token,
    username: user.username
  };


  return res.status(200).json({
    message: "Sesión iniciada correctamente",
    token: new_token
  });

});



regd_users.put("/auth/review/:isbn", (req, res) => {


  const username = req.session.authorization?.username;


  if (!username) {
    return res.status(401).json({
      message: "No existe una sesión iniciada"
    });
  }


  const isbn = req.params.isbn;


  const book = books[isbn];


  if (!book) {
    return res.status(404).json({
      message:"Libro no encontrado"
    });
  }


  const { review } = req.body;


  if (!review) {
    return res.status(400).json({
      message:"La review es requerida"
    });
  }


  book.reviews[username] = review;


  return res.status(200).json({
    message:"Review agregada"
  });

});



regd_users.delete("/auth/review/:isbn", (req, res) => {


  const username = req.session.authorization?.username;


  if (!username) {
    return res.status(401).json({
      message:"No existe una sesión iniciada"
    });
  }


  const isbn = req.params.isbn;


  const book = books[isbn];


  if (!book) {
    return res.status(404).json({
      message:"Libro no encontrado"
    });
  }


  if (!book.reviews[username]) {
    return res.status(404).json({
      message:"No existe una review de este usuario"
    });
  }


  delete book.reviews[username];


  return res.status(200).json({
    message:"Review eliminada correctamente"
  });

});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;