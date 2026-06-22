const express = require('express');
const router = express.Router();
const Enquiry = require('../models/EnquirySchema');

// Route: Submit Enquiry
router.post('/submit', async (req, res) => {
    try {
        const { fullName, mobile, email, subject, message } = req.body;

        if (!fullName || !mobile || !subject || !message) {
            return res.status(400).json({ success: false, message: "Please fill in all required fields." });
        }

        const newEnquiry = new Enquiry({
            fullName,
            mobile,
            email,
            subject,
            message
        });

        await newEnquiry.save();

        res.json({
            success: true,
            message: "Enquiry submitted successfully! We will contact you soon."
        });
    } catch (error) {
        console.error("Enquiry submission error:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
});

module.exports = router;
