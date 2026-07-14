const test = require('node:test');
const assert = require('node:assert/strict');
const { app } = require('../index.js');

test('should list books, search them, register/login, and manage reviews', async () => {
  const server = app.listen(0);

  await new Promise((resolve) => server.once('listening', resolve));

  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const booksResponse = await fetch(`${baseUrl}/books`);
    assert.equal(booksResponse.status, 200);
    const books = await booksResponse.json();
    assert.ok(Array.isArray(books));
    assert.ok(books.length > 0);

    const searchResponse = await fetch(`${baseUrl}/books/search?q=principito`);
    assert.equal(searchResponse.status, 200);
    const foundBooks = await searchResponse.json();
    assert.ok(foundBooks.some((book) => book.title.toLowerCase().includes('principito')));

    const registerResponse = await fetch(`${baseUrl}/customer/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'tester', password: 'secret123' })
    });
    assert.equal(registerResponse.status, 201);
    const registerData = await registerResponse.json();
    assert.equal(registerData.user.username, 'tester');

    const loginResponse = await fetch(`${baseUrl}/customer/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'tester', password: 'secret123' })
    });
    assert.equal(loginResponse.status, 200);
    const loginData = await loginResponse.json();
    assert.ok(loginData.token);

    const addReviewResponse = await fetch(`${baseUrl}/books/978-0-306-40615-7/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginData.token}`
      },
      body: JSON.stringify({ comment: 'Excelente libro' })
    });
    assert.equal(addReviewResponse.status, 201);
    const review = await addReviewResponse.json();
    assert.ok(review.id);

    const updateReviewResponse = await fetch(`${baseUrl}/books/978-0-306-40615-7/reviews/${review.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginData.token}`
      },
      body: JSON.stringify({ comment: 'Muy buen libro' })
    });
    assert.equal(updateReviewResponse.status, 200);

    const deleteReviewResponse = await fetch(`${baseUrl}/books/978-0-306-40615-7/reviews/${review.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${loginData.token}`
      }
    });
    assert.equal(deleteReviewResponse.status, 200);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
