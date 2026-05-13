
const bcrypt = require('bcrypt');
const { readUsers, writeUsers } = require('../models/userModels');

function hidePassword(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

function getUserProfile(req, res) {
    try {
        const users = readUsers();
        const user = users.find(user => user.id === req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User topilmadi' });
        }

        res.json(hidePassword(user));
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

function getAllUsers(req, res) {
    try {
        const users = readUsers();
        res.json(users.map(hidePassword));
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

function getUserById(req, res) {
    try {
        const users = readUsers();
        const user = users.find(user => user.id === Number(req.params.id));

        if (!user) {
            return res.status(404).json({ message: 'User topilmadi' });
        }

        res.json(hidePassword(user));
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

function createUser(req, res) {
    try {
        const { full_name, email, age, password } = req.body;

        if (!full_name || !email || !age || !password) {
            return res.status(400).json({ message: 'Barcha maydonlarni toldiring' });
        }

        const users = readUsers();
        const existingUser = users.find(user => user.email === email);

        if (existingUser) {
            return res.status(400).json({ message: 'Bu email oldin royxatdan otgan' });
        }

        const newUser = {
            id: Date.now(),
            full_name,
            email,
            age,
            password: bcrypt.hashSync(password, 10)
        };

        users.push(newUser);
        writeUsers(users);

        res.status(201).json(hidePassword(newUser));
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

function updateUser(req, res) {
    try {
        const users = readUsers();
        const userIndex = users.findIndex(user => user.id === Number(req.params.id));

        if (userIndex === -1) {
            return res.status(404).json({ message: 'User topilmadi' });
        }

        const { full_name, email, age, password } = req.body;

        if (email) {
            const existingUser = users.find(user => user.email === email && user.id !== Number(req.params.id));

            if (existingUser) {
                return res.status(400).json({ message: 'Bu email oldin royxatdan otgan' });
            }
        }

        users[userIndex] = {
            ...users[userIndex],
            full_name: full_name || users[userIndex].full_name,
            email: email || users[userIndex].email,
            age: age || users[userIndex].age,
            password: password ? bcrypt.hashSync(password, 10) : users[userIndex].password
        };

        writeUsers(users);

        res.json(hidePassword(users[userIndex]));
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

function deleteUser(req, res) {
    try {
        const users = readUsers();
        const userIndex = users.findIndex(user => user.id === Number(req.params.id));

        if (userIndex === -1) {
            return res.status(404).json({ message: 'User topilmadi' });
        }

        users.splice(userIndex, 1);
        writeUsers(users);

        res.json({ message: 'User ochirildi' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    getUserProfile,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
