const express = require('express');
const app = express();
const port = 8080;
const userRoutes = require('./routes/userRoutes');
app.use(express.json());
app.use('/api/users', userRoutes);


app.get('/', (req, res) => {
    res.send('<h1>Welcome to User API');
});

app.listen(port, () => {
    console.log(`Server ${port} portida ishga tushdi...`);
});

module.exports = app;