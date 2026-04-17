const express = require("express");
const fs = require("fs");
const app = express();  
const PORT = 5000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("<h1>Salom, Sardor!</h1>");
});

app.get("/users", (req, res) => {
    let users = getUsers();
    res.json(users);
});
app.get("/countries", (req, res) => {
    let users = getCountries(); 
    res.json(users);
});

app.post("/user", (req, res) => {
    try {
        let users = getUsers();
        const newUser = {
            id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
            ...req.body
        };
        users.push(newUser);
        fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
        
        res.json({
            message: "User created",
            user: newUser
        });
    } catch (error) {
        res.status(500).json({ error: "Server xatosi yuz berdi" });
    }
});

function getCountries() {
    try {
        let data = fs.readFileSync("users.json", "utf-8"); 
        let users = JSON.parse(data || "[]");
        return [...new Set(users.map(user => user.country))];
    } catch (error) {
        console.error("Faylni o'qishda xatolik (Countries):", error);
        return [];
    }
}

function getUsers() {
    try {
        let users = fs.readFileSync("users.json", "utf-8");
        return JSON.parse(users || "[]");
    } catch (error) {
        console.error("Faylni o'qishda xatolik (Users):", error);
        return [];
    }
}



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// module.exports = app;