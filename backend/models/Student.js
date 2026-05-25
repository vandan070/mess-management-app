const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  studentId: { type: String, required: true, unique: true },
  
  // Financial Tracking
  joiningDate: { type: Date, default: Date.now },
  lastPaymentDate: { type: Date },
  subscriptionEndDate: { type: Date, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['Paid', 'Pending', 'Overdue'], 
    default: 'Pending' 
  },
  
  // Daily Operations
  mealsClaimedToday: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);