const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');

const MONGO_URI = 'mongodb://messAdmin:MessAdmin2026@ac-dxwpuzy-shard-00-00.m12kmcq.mongodb.net:27017,ac-dxwpuzy-shard-00-01.m12kmcq.mongodb.net:27017,ac-dxwpuzy-shard-00-02.m12kmcq.mongodb.net:27017/MessApp?ssl=true&replicaSet=atlas-xk1ssp-shard-0&authSource=admin&appName=MessManagementSystem';

const students = [
  { id: 'S1001', name: 'Alice Smith' },
  { id: 'S1002', name: 'Bob Jones' },
  { id: 'S1003', name: 'Charlie Brown' },
  { id: 'S1004', name: 'Diana Prince' }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    // Create records for the past 10 days
    const records = [];
    for (let i = 1; i <= 10; i++) { // Past 10 days (excluding today)
      const date = new Date();
      date.setDate(date.getDate() - i); 
      
      students.forEach((student, index) => {
        // Pseudo-random distribution so not every student checks in every day
        if ((i + index) % 3 !== 0) { 
            records.push({
              studentId: student.id,
              name: student.name,
              type: 'Lunch',
              date: date,
              time: '12:30 PM'
            });
        }
      });
    }

    await Attendance.insertMany(records);
    console.log(`Successfully seeded ${records.length} historical attendance records.`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seed();
