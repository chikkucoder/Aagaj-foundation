// d:\Agaz foundation\AddNewEmployeeRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Employee = require('../models/AddNewEmployeeSchema');
const { Applicant, NormalApplicant } = require('../models/ApplicationSchema');

// Route: Add New Employee
router.post('/add-employee-direct', async (req, res) => {
    try {
        const { fullName, email, mobile, designation, district, state, password } = req.body;

        // 1. Check if email already exists
        const existingUser = await Employee.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email ID already registered!" });
        }

        // 2. Generate Employee ID (EMP0001, EMP0002...)
        // FIX: Use findOne().sort() instead of countDocuments() to avoid duplicates after deletion
        const lastEmployee = await Employee.findOne().sort({ _id: -1 });
        let nextId = "EMP0001";

        if (lastEmployee && lastEmployee.empId) {
            const lastIdNum = parseInt(lastEmployee.empId.replace("EMP", ""), 10);
            if (!isNaN(lastIdNum)) nextId = "EMP" + (lastIdNum + 1).toString().padStart(4, '0');
        }

        // 3. Hash Password (Security ke liye)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Save to Database
        const newEmployee = new Employee({
            empId: nextId,
            fullName,
            email,
            mobile,
            designation,
            district,
            state,
            password: hashedPassword
        });

        await newEmployee.save();

        // 5. Send Success Response
        res.json({ 
            success: true, 
            message: "Employee Added Successfully!", 
            username: email, 
        });

    } catch (error) {
        console.error("Add Employee Error:", error);
        // Send actual error message for debugging
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
});

// Route: Create/Update Password for Existing Applicant (NGO/Normal)
router.post('/create-password', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and Password are required" });
        }

        // 1. Search in NGO Applicants
        let user = await Applicant.findOne({ email });
        let collectionName = "NGO Applicant";

        // 2. If not found, search in Normal Applicants
        if (!user) {
            user = await NormalApplicant.findOne({ email });
            collectionName = "Normal Applicant";
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found in NGO or Normal jobs list." });
        }

        // 3. Update Credentials
        const salt = await bcrypt.genSalt(10);
        user.emp_username = email;
        user.emp_password = await bcrypt.hash(password, salt);
        
        
        await user.save();

        res.json({ success: true, message: `Password updated for ${collectionName}`, username: email});

    } catch (error) {
        console.error("Create Password Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;
