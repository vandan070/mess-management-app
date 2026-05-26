const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

// POST /login - Authenticate Admin
router.post('/login', async (req, res) => {
  try {
    const { adminId, password } = req.body;
    if (!adminId || !password) {
      return res.status(400).json({ message: "adminId and password are required." });
    }

    const admin = await Admin.findOne({ adminId });
    if (!admin || admin.password !== password) {
      return res.status(401).json({ message: "Invalid Admin ID or Password." });
    }

    return res.status(200).json({ message: "Login successful", adminId: admin.adminId });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// PUT /password - Update Admin Password & Optional Mobile
router.put('/password', async (req, res) => {
  try {
    const { adminId, currentPassword, newPassword, mobileNumber } = req.body;

    if (!adminId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "adminId, currentPassword, and newPassword are required." });
    }

    // 1. Fetch admin document
    const admin = await Admin.findOne({ adminId: adminId });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    // 2. Validate current password (direct string comparison as per spec)
    if (admin.password !== currentPassword) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    // 3. Update fields
    admin.password = newPassword;
    if (mobileNumber !== undefined) {
      admin.mobileNumber = mobileNumber;
    }

    // 4. Save to DB
    await admin.save();
    
    return res.status(200).json({ message: "Password and details updated successfully!" });
  } catch (error) {
    console.error("Error updating admin details:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST /verify-mobile - Check if mobile matches an admin
router.post('/verify-mobile', async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    if (!mobileNumber) return res.status(400).json({ message: "Mobile number is required." });

    const admin = await Admin.findOne({ mobileNumber });
    if (!admin) return res.status(404).json({ message: "No admin found with this mobile number." });

    return res.status(200).json({ message: "Mobile verified.", adminId: admin.adminId });
  } catch (error) {
    console.error("Verify mobile error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST /reset-pin - Reset password after mobile verification
router.post('/reset-pin', async (req, res) => {
  try {
    const { adminId, newPassword } = req.body;
    if (!adminId || !newPassword) return res.status(400).json({ message: "adminId and newPassword required." });

    const admin = await Admin.findOne({ adminId });
    if (!admin) return res.status(404).json({ message: "Admin not found." });

    admin.password = newPassword;
    await admin.save();
    
    return res.status(200).json({ message: "Admin PIN reset successfully." });
  } catch (error) {
    console.error("Reset pin error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
