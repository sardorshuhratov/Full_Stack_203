const { readStudents, writeStudent } = require('../models/studentModel');

// Barcha talabalarni olish
function getAllStudents(req, res) {
    try {
        const students = readStudents();
        res.status(200).json({ data: students });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}

// Bitta talabani id orqali olish
function getStudentById(req, res) {
    try {
        const students = readStudents();
        const student = students.find(s => s.id == req.params.id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.status(200).json({ data: student });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}

// Yangi talaba qo'shish
function createStudent(req, res) {
    try {
        const { name, surname, age, yonalishi, rasmi, tel } = req.body;
        if (!name || !surname || !age || !yonalishi || !tel) {
            return res.status(400).json({ message: "Barcha kerakli maydonlarni to'ldiring: name, surname, age, yonalishi, tel" });
        }

        const students = readStudents();
        const newStudent = {
            id: Date.now(),
            name,
            surname,
            age,
            yonalishi,
            rasmi: rasmi || "",
            tel
        };

        students.push(newStudent);
        writeStudent(students);

        res.status(201).json({ message: "Student created successfully", data: newStudent });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}

// Talabani yangilash
function updateStudent(req, res) {
    try {
        const students = readStudents();
        const index = students.findIndex(s => s.id == req.params.id);

        if (index === -1) {
            return res.status(404).json({ message: "Student not found" });
        }

        const { name, surname, age, yonalishi, rasmi, tel } = req.body;

        const updatedStudent = {
            ...students[index],
            name: name || students[index].name,
            surname: surname || students[index].surname,
            age: age || students[index].age,
            yonalishi: yonalishi || students[index].yonalishi,
            rasmi: rasmi !== undefined ? rasmi : students[index].rasmi,
            tel: tel || students[index].tel
        };

        students[index] = updatedStudent;
        writeStudent(students);

        res.status(200).json({ message: "Student updated successfully", data: updatedStudent });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}

// Talabani o'chirish
function deleteStudent(req, res) {
    try {
        let students = readStudents();
        const index = students.findIndex(s => s.id == req.params.id);

        if (index === -1) {
            return res.status(404).json({ message: "Student not found" });
        }

        students = students.filter(s => s.id != req.params.id);
        writeStudent(students);

        res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
};
