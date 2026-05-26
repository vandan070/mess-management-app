const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, default: 'Meal Claim' },
  date: { type: Date, default: Date.now },
  time: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
