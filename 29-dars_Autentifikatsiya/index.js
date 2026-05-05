require('dotenv').config();
const express = require('express');
const app = express();
const port = 3002;
const authRoutes = require('./routes/authRoutes');
app.use(express.json());

app.use('/api/auth', authRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;