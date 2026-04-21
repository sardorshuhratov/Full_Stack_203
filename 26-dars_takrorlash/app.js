const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;
const file = 'tasks.json';

app.use(express.json());
let users = [
  { id: 1, name: 'John Doe', age: 30 },
  { id: 2, name: 'Jane Smith', age: 25 },
  { id: 3, name: 'Alice Johnson', age: 28 },
  { id: 4, name: 'Bob Williams', age: 35 },
  { id: 5, name: 'Eva Brown', age: 22 },
  { id: 6, name: 'Michael Davis', age: 31 }
];

app.get('/', function (req, res) {
  res.send('<h1>Assalomu alaykum</h1>');
});

app.post('/api/info', (req, res) => {
  try {
    let { title, description } = req.body;
    res.json({ title, description });
  } catch (error) {
    res.json({ error: 'Xatolik yuz berdi' });
  }
});

app.get('/api/users', (req, res) => {
  try {
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Xatolik yuz berdi' });
  }
});

app.get('/api/users/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }
  } catch (error) { 
    res.status(500).json({ error: 'Xatolik yuz berdi' });
  }
});

app.listen(port, () => {
  console.log(`Loyihamiz http://localhost:${port} da ishlayabdi`);
});

module.exports = app;
