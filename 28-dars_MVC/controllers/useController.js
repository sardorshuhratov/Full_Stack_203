const { readUsers, writeUsers } = require('../models/userModel');


function getAllUsers(req, res) {
    try {
        let users = readUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Serverda xatolik sodir boldi!' });
    }
}

function getUserById(req, res) {
    try {
        let { id } = req.params;
        let users = readUsers();
        let user = users.find(u => u.id == id);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: 'User topilmadi' });
        }
    } catch (error) {
        res.status(404).json({ error: 'User topilmadi' });
    }
}

function addNewUser(req, res) {
    try {
        let { name, email, age } = req.body;
        let users = readUsers();
        let ids = users.map(user => user.id).sort((a, b) => a - b);
        let newId = 1;

        for (let id of ids) {
            if (id === newId) {
                newId++;
            } else if (id > newId) {
                break;
            }
        }
        let newUser = {
            id: newId,
            name,
            email,
            age
        }
        users.push(newUser);
        writeUsers(users);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'Serverda xatolik sodir boldi!' });
    }   
}

function updateUser(req, res) {
    try {
        let { id } = req.params;
        let { name, email, age } = req.body;
        let users = readUsers();
        let user = users.find(u => u.id == id);
        if (user) {
            user.name = name;
            user.email = email;
            user.age = age;
            writeUsers(users);
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: 'User topilmadi' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Serverda xatolik sodir boldi!' });
    }   
}   

function deleteUser(req, res) {
    try {
        let { id } = req.params;        
        let users = readUsers();
        let userIndex = users.findIndex(u => u.id == id);
        if (userIndex !== -1) {
            users.splice(userIndex, 1);
            writeUsers(users);
            res.status(200).json({ message: 'User o\'chirildi' }); 
        } else {
            res.status(404).json({ error: 'User topilmadi' });
        }   
    } catch (error) {
        res.status(500).json({ error: 'Serverda xatolik sodir boldi!' });
    }   
}
module.exports = {
    getAllUsers, getUserById, addNewUser, updateUser, deleteUser
}
