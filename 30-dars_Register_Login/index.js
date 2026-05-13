require('dotenv').config();
const express = require('express');
const app = express();
const port = 3003;
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { authMiddleware } = require('./middleware/authMiddleware');

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/user', authMiddleware, userRoutes);

app.get('/', (req, res) => {
    res.send('<h1>Welcome to the User Authentication API');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;