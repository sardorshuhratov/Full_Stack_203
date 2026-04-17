const express = require("express");
const fs = require("fs");
const app = express();
const port = 5000;
const file = "tasks.json";

app.use(express.json());
app.get("/", (req, res) => {
    res.json({ message: "Hello World!" });
});

app.get("/tasks", (req, res) => {
    try {
        const tasks = fs.readFileSync(file, "utf-8");
        tasks = JSON.parse(tasks);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: "Failed to read tasks" });
    }
});

app.get("/tasks/:id", (req, res) => {
    
    try {
        const id = req.params.id;
        const tasks = fs.readFileSync(file, "utf-8");
        tasks = JSON.parse(tasks);
        const task = tasks.find(task => task.id === id);
        if (task) {
            res.json(task);
        } else {
            res.status(404).json({ error: "Task not found" });
        }
    } catch (error) {
        res.status(500).json({error: "Failed to read tasks"});
    
    }
});

app.post("/tasks", (req, res) => {  
    try {
        const { title, description } = req.body;
        const tasks = fs.readFileSync(file, "utf-8");
        tasks = JSON.parse(tasks);
        const id = tasks.length + 1;
        const newTask = { id, title, description };

        tasks.push(newTask);
        fs.writeFileSync(file, JSON.stringify(tasks));
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: "Failed to create task" });
    }
});

app.delete("/tasks/:id", (req, res) => {
    try {
        const id = req.params.id;

        let tasks = fs.readFileSync(file, "utf-8");
        tasks = JSON.parse(tasks);
        const taskIndex = tasks.findIndex(task => task.id === id);

        if (taskIndex !== -1) {
            const deletedTask = tasks.splice(taskIndex, 1)[0];
            fs.writeFileSync(file, JSON.stringify(tasks));
            res.json(deletedTask);
        } else {
            res.status(404).json({ error: "Task not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to delete task" });
    }
});

app.put("/tasks/:id", (req, res) => {
    try {
        const id = req.params.id;
        const { title, description } = req.body;

        let tasks = fs.readFileSync(file, "utf-8");
        tasks = JSON.parse(tasks);
        const taskIndex = tasks.findIndex(task => task.id === id);

        if (taskIndex !== -1) {
            const updatedTask = { id, title, description };
            tasks[taskIndex] = updatedTask;
            fs.writeFileSync(file, JSON.stringify(tasks));
            res.json(updatedTask);
        } else {
            res.status(404).json({ error: "Task not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to update task" });
    }
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

module.exports = app;