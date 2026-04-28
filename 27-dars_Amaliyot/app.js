// CRUD - Mustaqil amaliyot

const fs = require('fs');
const path = require('path');
const express = require("express");
const app = express();
const port = 8080;
const file = path.join(__dirname, 'users.json');

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Assalomu alaykum" });
});

readUsers = () => {
    try {
        const users = fs.readFileSync(file, "utf-8");
        return JSON.parse(users);
    } catch (error) {
        return [];
    }
};

writeUsers = (users) => {
    fs.writeFileSync(file, JSON.stringify(users));
};

app.get("/api/users", (req, res) => {
    try {
        const users = readUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to read users" });
    }
});

app.get("/api/users/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        const users = readUsers();
        const user = users.find(user => user.id === id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: "User topilmadi" });
        }
    } catch (error) {
        res.status(500).json({ error: "Bunaqa id li user yoq" });
    }
});

app.post("/api/users", (req, res) => {
    try {
        const { name, email, age } = req.body;
        const users = readUsers();
        const id = Math.max(...users.map(user => user.id)) + 1;
        const newUser = { id, name, email, age };
        users.push(newUser);
        writeUsers(users);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: "Failed to create user" });
    }
});

app.put("/api/users/:id", (req, res) => {
    try {
        const users = readUsers();
        const id = Number(req.params.id);
        const userIndex = users.findIndex(user => user.id === id);
        if (userIndex === -1) {
            return res.status(404).json({ error: "User topilmadi" });
        }
        const updatedUser = { ...users[userIndex], ...req.body, id };
        users[userIndex] = updatedUser;
        writeUsers(users);
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: "Failed to update user" });
    }
});

app.delete("/api/users/:id", (req, res) => {
    try {
        const users = readUsers();
        const id = Number(req.params.id);
        const userIndex = users.findIndex(user => user.id === id);
        if (userIndex === -1) {
            return res.status(404).json({ error: "User topilmadi" });
        }
        const deletedUser = users.splice(userIndex, 1)[0];
        writeUsers(users);
        res.json(deletedUser).json({ message: "User ochirildi" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete user" });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

module.exports = app;
