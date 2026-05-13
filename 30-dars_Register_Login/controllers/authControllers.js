const bcrypt = require("bcrypt");
const { readUsers, writeUsers } = require('../models/userModels');
const { generateToken } = require('../libs/token');

function register(req, res) {
  try {
    const { full_name, email, age, password } = req.body;
    // console.log("User data:", { full_name, email, age, password });
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

function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Maydonni to'ldiring" });
    } 
    let users = readUsers();
    let user = users.find(user => user.email === email);
    if (!user) {
      return res.status(404).json({ message: "Bu email royxatdan o'tmagan" });
    }
    let isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Parol xato" });
    } 

    let token = generateToken(user);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
  
}

module.exports = {
  register, login
}