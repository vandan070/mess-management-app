const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
const MONGO_URI = 'mongodb://messAdmin:MessAdmin2026@ac-dxwpuzy-shard-00-00.m12kmcq.mongodb.net:27017,ac-dxwpuzy-shard-00-01.m12kmcq.mongodb.net:27017,ac-dxwpuzy-shard-00-02.m12kmcq.mongodb.net:27017/MessApp?ssl=true&replicaSet=atlas-xk1ssp-shard-0&authSource=admin&appName=MessManagementSystem';

async function removeSeed() {
  try {
    await mongoose.connect(MONGO_URI);
    const res = await Attendance.deleteMany({ name: { $in: ['Alice Smith', 'Bob Jones', 'Charlie Brown', 'Diana Prince'] } });
    console.log('Deleted ' + res.deletedCount + ' temporary dummy records.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

removeSeed();
