const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  adminId: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // This will store the hashed password, never plain text!
  mobileNumber: { type: String, required: false, length: 10 }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);