const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();
const Admin = require('../models/AdminRegisterSchema');
const OtpStore = require('../models/OtpStore');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendMail } = require('../services/emailService');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// ✅ 1. Check if Admin Exists
router.get('/check-admin-exists', async (req, res) => {
    try {
        const count = await Admin.countDocuments();
        res.json({ exists: count > 0 });
    } catch (error) {
        res.status(500).json({ exists: false, message: error.message });
    }
});

// ✅ 2. REGISTER ROUTE (Fixed: Removed Double Hashing)
router.post('/register', async (req, res) => {
    try {
        // Step 1: Check Database Count
        const adminCount = await Admin.countDocuments();
        
        if (adminCount > 0) {
            return res.status(403).json({ 
                success: false, 
                message: "Security Alert: Admin already exists! Registration is disabled." 
            });
        }

        const { fullName, email, password } = req.body;

        // ⚠️ FIX: Yahan se manual hashing hata di gayi hai.
        // AdminRegisterSchema.js apne aap 'pre-save' hook me password hash kar dega.
        
        const newAdmin = new Admin({ 
            fullName, 
            email, 
            password: password // Plain password bhejo, Schema ise encrypt karega
        });

        await newAdmin.save();
        
        res.json({ success: true, message: "Admin Registered Successfully! Redirecting..." });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ 3. LOGIN ROUTE
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const cleanEmail = String(email || '').trim();

        if (!cleanEmail || !password) {
            return res.json({ success: false, message: "Email and password are required" });
        }

        const safeEmail = cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const admin = await Admin.findOne({
            $or: [
                { email: cleanEmail },
                { email: new RegExp(`^${safeEmail}$`, 'i') }
            ]
        });

        if (!admin) return res.json({ success: false, message: "Invalid Credentials" });

        // Ab ye sahi se compare karega
        const isMatch = await bcrypt.compare(password, admin.password);
        
        if (isMatch) {
            const token = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
            res.json({ 
                success: true, 
                token: token, 
                admin: { fullName: admin.fullName, email: admin.email } 
            });
        } else {
            res.json({ success: false, message: "Invalid Credentials" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});


// ==========================================
// FORGOT PASSWORD & OTP LOGIC
// ==========================================

// ✅ MongoDB-based OTP Storage (TTL enabled)
const otpService = {
    set: async (email, otp) => {
        await OtpStore.findOneAndUpdate(
            { email },
            { otp, createdAt: new Date() },
            { upsert: true, new: true }
        );
    },
    get: async (email) => {
        const record = await OtpStore.findOne({ email });
        return record ? record.otp : null;
    },
    delete: async (email) => {
        await OtpStore.deleteOne({ email });
    }
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 🟢 1. Send OTP Route
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ success: false, message: "This email is not registered as Admin." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // ✅ Store OTP in MongoDB (TTL 10 minutes)
        await otpService.set(email, otp);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Aagaj Foundation - Password Reset OTP',
            html: `<h3>Hello ${admin.fullName},</h3>
                   <p>Your OTP for password reset is: <strong style="font-size: 24px; color: #ED1C24;">${otp}</strong></p>
                   <p>This OTP is valid for 10 minutes.</p>
                   <p>Do not share this OTP with anyone.</p>`
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "OTP sent successfully to your email." });

    } catch (error) {
        console.error("OTP Send Error:", error);
        res.status(500).json({ success: false, message: "Failed to send OTP." });
    }
});

// 🟢 2. Verify OTP & Reset Password Route
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        // ✅ Get OTP from MongoDB
        const storedOtp = await otpService.get(email);
        
        // Check if OTP is correct
        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid or Expired OTP." });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found." });
        }

        // Update password (Schema pre-save hook automatically hashes it)
        admin.password = newPassword;
        await admin.save();

        // Delete OTP after successful reset
        await otpService.delete(email);

        res.json({ success: true, message: "Password reset successfully! You can now log in." });

    } catch (error) {
        console.error("Password Reset Error:", error);
        res.status(500).json({ success: false, message: "Failed to reset password." });
    }
});

// 🟢 3. Authenticated Change Password Route
router.post('/change-password', async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;

        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Email, Current Password, and New Password are required." });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "New password must be at least 6 characters long." });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin account not found." });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect current password. Please check and try again." });
        }

        // Update password (Schema pre-save hook automatically hashes newPassword)
        admin.password = newPassword;
        await admin.save();

        res.json({ success: true, message: "Password changed successfully!" });

    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({ success: false, message: "Server error while changing password." });
    }
});

// 🟢 4. Update Admin Profile Route
router.put('/update-profile', async (req, res) => {
    try {
        const { currentEmail, fullName, newEmail } = req.body;

        if (!currentEmail) {
            return res.status(400).json({ success: false, message: "Current email is required." });
        }

        const admin = await Admin.findOne({ email: currentEmail });
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin account not found." });
        }

        if (fullName && fullName.trim()) {
            admin.fullName = fullName.trim();
        }

        if (newEmail && newEmail.trim() !== currentEmail) {
            const emailExists = await Admin.findOne({ email: newEmail.trim() });
            if (emailExists) {
                return res.status(400).json({ success: false, message: "Email address is already in use by another admin." });
            }
            admin.email = newEmail.trim();
        }

        await admin.save();

        res.json({
            success: true,
            message: "Profile details updated successfully!",
            admin: { fullName: admin.fullName, email: admin.email, role: admin.role || 'Super Admin' }
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ success: false, message: "Server error while updating profile." });
    }
});

module.exports = router;
