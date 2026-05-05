const bcrypt = require("bcrypt");
const { readUsers, writeUsers } = require('../models/userModels');

function register(req, res) {
  try {
    const { full_name, email, age, password } = req.body;
    console.log("User data:", { full_name, email, age, password });
    if (!full_name || !email || !age || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    let users = readUsers();
    let existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    
    let newId = Date.now();
    let hashPassword = bcrypt.hashSync(password, 10);
    let newUser = { id: newId, full_name, email, age, password: hashPassword };
  
    users.push(newUser);
    writeUsers(users);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  register
}