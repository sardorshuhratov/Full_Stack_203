const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'students.json')

function readStudents() {
    const data = fs.readFileSync(file, 'utf-8');
    return JSON.parse(data)
}
function writeStudent(students) {
    fs.writeFileSync(file, JSON.stringify(students, null, 2))
}

module.exports = { readStudents, writeStudent };
