const express = require('express');
const router = express.Router();
const Enquiry = require('../models/EnquirySchema');

// Route: Get All Enquiries
router.get('/all', async (req, res) => {
    try {
        const enquiries = await Enquiry.find().sort({ createdAt: -1 }).lean();
        res.json({ success: true, data: enquiries });
    } catch (error) {
        console.error("Admin Fetch Enquiries Error:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
});

// Route: Toggle/Mark Enquiry Status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Pending', 'Resolved'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value." });
        }

        const updatedEnquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!updatedEnquiry) {
            return res.status(404).json({ success: false, message: "Enquiry not found." });
        }

        res.json({ success: true, message: `Enquiry status updated to ${status}`, data: updatedEnquiry });
    } catch (error) {
        console.error("Admin Update Enquiry Status Error:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
});

// Route: Delete Enquiry
router.delete('/:id', async (req, res) => {
    try {
        const deletedEnquiry = await Enquiry.findByIdAndDelete(req.params.id);
        if (!deletedEnquiry) {
            return res.status(404).json({ success: false, message: "Enquiry not found." });
        }
        res.json({ success: true, message: "Enquiry deleted successfully." });
    } catch (error) {
        console.error("Admin Delete Enquiry Error:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
});

module.exports = router;
