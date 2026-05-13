const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token topilmadi' });
        }

        const user = jwt.verify(token, process.env.secret_key);
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token xato yoki eskirgan' });
    }
}

module.exports = { authMiddleware };
