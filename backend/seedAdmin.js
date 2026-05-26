const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const MONGO_URI = 'mongodb://messAdmin:MessAdmin2026@ac-dxwpuzy-shard-00-00.m12kmcq.mongodb.net:27017,ac-dxwpuzy-shard-00-01.m12kmcq.mongodb.net:27017,ac-dxwpuzy-shard-00-02.m12kmcq.mongodb.net:27017/MessApp?ssl=true&replicaSet=atlas-xk1ssp-shard-0&authSource=admin&appName=MessManagementSystem';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    
    // Check if admin exists
    const existingAdmin = await Admin.findOne({ adminId: 'admin' });
    if (!existingAdmin) {
      await Admin.create({
        adminId: 'admin',
        password: '1234',
        mobileNumber: '9999999999'
      });
      console.log('Master Admin account created: ID: admin, PASS: 1234');
    } else {
      console.log('Admin account already exists.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
}

seedAdmin();
