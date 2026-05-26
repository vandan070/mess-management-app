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
const adminRoutes = require('./routes/adminRoutes');

// Use Routes
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);

// Environment Variables
const PORT = process.env.PORT || 5000;
// Bypassing mongodb+srv:// due to Windows DNS SRV bug. Using direct replica set nodes.
const MONGO_URI = 'mongodb://messAdmin:MessAdmin2026@ac-dxwpuzy-shard-00-00.m12kmcq.mongodb.net:27017,ac-dxwpuzy-shard-00-01.m12kmcq.mongodb.net:27017,ac-dxwpuzy-shard-00-02.m12kmcq.mongodb.net:27017/MessApp?ssl=true&replicaSet=atlas-xk1ssp-shard-0&authSource=admin&appName=MessManagementSystem';
console.log("Connecting to:", MONGO_URI);
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