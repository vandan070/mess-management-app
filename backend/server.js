require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json()); 
// Import Routes
const studentRoutes = require('./routes/studentRoutes');

// Use Routes
app.use('/api/students', studentRoutes);

// Environment Variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mess-management'; 

// Database Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// A simple test route
app.get('/', (req, res) => {
  res.send('Mess Management API is running...');
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});