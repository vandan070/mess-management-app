const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

// GET ALL STUDENTS
router.get('/', async (req, res) => {
  try {
    const students = await Student.find({});
    
    let updated = false;
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    for (let student of students) {
      if (student.subscriptionEndDate) {
        const expiryDate = new Date(student.subscriptionEndDate);
        expiryDate.setHours(0, 0, 0, 0);
        
        // If expiry date has passed or is today, and they are not already Partially Paid
        if (expiryDate <= now && student.paymentStatus !== 'Partially Paid') {
          student.paymentStatus = 'Partially Paid';
          await student.save();
          updated = true;
        }
      }
    }

    const finalStudents = updated ? await Student.find({}) : students;
    res.status(200).json(finalStudents);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Server error fetching students." });
  }
});

// 1. ADD NEW STUDENT ROUTE
// This connects to the 'Add Student' form on your Admin Hub
router.post('/add', async (req, res) => {
  try {
    const { name, studentId, mobileNumber, subscriptionEndDate, paymentStatus } = req.body;

    if (!name || !studentId || !mobileNumber || !subscriptionEndDate) {
      return res.status(500).json({ message: "Validation error: Missing required fields." });
    }

    // Check if a student with this ID already exists
    const existingStudent = await Student.findOne({ studentId: studentId });
    if (existingStudent) {
      return res.status(400).json({ message: "A student with this ID already exists." });
    }

    // Create the new student using the data from React
    const newStudent = new Student({
      name: name,
      studentId: studentId,
      mobileNumber: mobileNumber,
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

// CLAIM MEAL ROUTE
router.post('/claim-meal', async (req, res) => {
  try {
    const { studentId, name, mealType } = req.body;
    
    if (!studentId || !name) {
      return res.status(400).json({ message: "studentId and name are required." });
    }

    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const newRecord = new Attendance({
      studentId: studentId,
      name: name,
      type: mealType || 'Meal Claim',
      time: time
    });

    await newRecord.save();
    res.status(201).json({ message: "Meal claimed successfully", attendance: newRecord });
  } catch (error) {
    console.error("Error claiming meal:", error);
    res.status(500).json({ message: "Server error claiming meal." });
  }
});

// GET ATTENDANCE HISTORY
router.get('/attendance/history', async (req, res) => {
  try {
    const { days } = req.query;
    let query = {};
    
    if (days) {
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - parseInt(days));
      // Set to start of day
      dateLimit.setHours(0, 0, 0, 0);
      query.date = { $gte: dateLimit };
    }

    const records = await Attendance.find(query).sort({ date: -1, createdAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Server error fetching attendance." });
  }
});

// DELETE STUDENT
router.delete('/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const deletedStudent = await Student.findOneAndDelete({ studentId: studentId });
    
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found." });
    }
    res.status(200).json({ message: "Student deleted successfully." });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Server error deleting student." });
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