const fs = require('fs');
const path = require('path');
let file = path.join(__dirname, '..', 'text.txt');

function readUsers() {
    let users = fs.readFileSync(file, 'utf-8');
    return JSON.parse(users);
}

function writeUsers(users) {
    fs.writeFileSync(file, JSON.stringify(users, null, 2));
}

module.exports = {
    readUsers, writeUsers
}