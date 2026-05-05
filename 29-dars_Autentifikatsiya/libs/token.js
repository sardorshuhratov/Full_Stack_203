const jwt = require('jsonwebtoken');
// const secret_key = '!#@$%^&^%$#@@';
const secret_key = process.env.secret_key;


function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email
    };
    
    return jwt.sign(payload, secret_key, { expiresIn: '1m' });
}

module.exports = {
    generateToken
};