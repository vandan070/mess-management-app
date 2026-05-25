const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// 1. ADD NEW STUDENT ROUTE
// This connects to the 'Add Student' form on your Admin Hub
router.post('/add', async (req, res) => {
  try {
    const { name, studentId, subscriptionEndDate, paymentStatus } = req.body;

    // Check if a student with this ID already exists
    const existingStudent = await Student.findOne({ studentId: studentId });
    if (existingStudent) {
      return res.status(400).json({ message: "A student with this ID already exists." });
    }

    // Create the new student using the data from React
    const newStudent = new Student({
      name: name,
      studentId: studentId,
      subscriptionEndDate: subscriptionEndDate,
      paymentStatus: paymentStatus || 'Pending'
    });

    // Save them to MongoDB
    await newStudent.save();
    
    res.status(201).json({ message: "Student added successfully!", student: newStudent });

  } catch (error) {
    console.error("Error adding student:", error);
    res.status(500).json({ message: "Server error while adding student." });
  }
});

// 2. FRICTIONLESS STUDENT LOGIN ROUTE
// This connects to your Student Login screen
router.post('/login', async (req, res) => {
  try {
    const { studentId } = req.body;

    // Search the database for this specific ID
    const student = await Student.findOne({ studentId: studentId });

    if (!student) {
      return res.status(404).json({ message: "Student ID not found." });
    }

    // Since we removed PINs, finding the student is enough to log them in.
    // We send back their name so the frontend can display the "Visual Confirmation".
    res.status(200).json({ 
      message: "Login successful", 
      studentId: student.studentId,
      name: student.name 
    });

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

// 3. GET STUDENT DATA ROUTE
// Fetches full details for the student dashboard
router.get('/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = await Student.findOne({ studentId: studentId });

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("Error fetching student data:", error);
    res.status(500).json({ message: "Server error fetching student data." });
  }
});

module.exports = router;