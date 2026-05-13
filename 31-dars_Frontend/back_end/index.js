require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const { authMiddleware } = require('./middleware/authMiddleware');

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/students', authMiddleware, studentRoutes);

app.get('/', (req, res) => {
    res.send('<h1>Welcome to the User Authentication API');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;
