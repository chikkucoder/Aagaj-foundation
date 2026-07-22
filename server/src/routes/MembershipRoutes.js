const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Membership = require('../models/MembershipSchema');

// Utility to generate unique Membership ID & Certificate No
const generateMembershipIds = async () => {
    const count = await Membership.countDocuments();
    const sequence = String(count + 1).padStart(5, '0');
    const year = new Date().getFullYear();
    const membershipId = `AF-MBR-${year}-${sequence}`;
    const certificateNo = `AF/MBR/${year}/${sequence}`;
    return { membershipId, certificateNo };
};

// POST /api/membership/register - Register a new member & record payment
router.post('/register', async (req, res) => {
    try {
        const {
            fullName,
            fatherOrHusbandName,
            dobOrAge,
            gender,
            photoUrl,
            mobileNumber,
            email,
            address,
            city,
            district,
            state,
            pincode,
            aadhaarNumber,
            panNumber,
            occupation,
            organization,
            membershipType,
            joiningDate,
            interestAreas,
            declarationAccepted,
            paymentAmount,
            paymentId
        } = req.body;

        if (!fullName || !fullName.trim()) {
            return res.status(400).json({ success: false, message: 'Full Name is required.' });
        }
        if (!mobileNumber || !mobileNumber.trim()) {
            return res.status(400).json({ success: false, message: 'Mobile Number is required.' });
        }
        if (!declarationAccepted) {
            return res.status(400).json({ success: false, message: 'You must accept the declaration.' });
        }
        
        const numericAmount = Number(paymentAmount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Please enter a valid payment amount.' });
        }

        const { membershipId, certificateNo } = await generateMembershipIds();
        const txnId = paymentId || `TXN-MBR-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        const orderId = `ORD-MBR-${Date.now()}`;

        const newMember = new Membership({
            membershipId,
            certificateNo,
            fullName: fullName.trim(),
            fatherOrHusbandName: fatherOrHusbandName ? fatherOrHusbandName.trim() : '',
            dobOrAge: dobOrAge ? dobOrAge.trim() : '',
            gender: gender || 'Other',
            photoUrl: photoUrl || '',
            mobileNumber: mobileNumber.trim(),
            email: email ? email.trim().toLowerCase() : '',
            address: address ? address.trim() : '',
            city: city ? city.trim() : '',
            district: district ? district.trim() : '',
            state: state ? state.trim() : '',
            pincode: pincode ? pincode.trim() : '',
            aadhaarNumber: aadhaarNumber ? aadhaarNumber.trim() : '',
            panNumber: panNumber ? panNumber.trim() : '',
            occupation: occupation ? occupation.trim() : '',
            organization: organization ? organization.trim() : '',
            membershipType: membershipType || 'General Member',
            joiningDate: joiningDate || new Date().toISOString().split('T')[0],
            interestAreas: Array.isArray(interestAreas) ? interestAreas : [],
            declarationAccepted: Boolean(declarationAccepted),
            paymentAmount: numericAmount,
            paymentStatus: 'Paid',
            paymentId: txnId,
            orderId: orderId,
            certificateIssued: true
        });

        await newMember.save();

        res.status(201).json({
            success: true,
            message: 'Membership registration successful and certificate generated!',
            data: newMember
        });

    } catch (error) {
        console.error('Error registering member:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during membership registration.'
        });
    }
});

// GET /api/membership/verify - Verify / Lookup member by Membership ID, Mobile, or Aadhaar
router.get('/verify', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || !query.trim()) {
            return res.status(400).json({ success: false, message: 'Please provide search query (Membership ID, Mobile, or Aadhaar).' });
        }

        const trimmed = query.trim();
        const member = await Membership.findOne({
            $or: [
                { membershipId: trimmed },
                { certificateNo: trimmed },
                { mobileNumber: trimmed },
                { aadhaarNumber: trimmed }
            ]
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'No membership record found matching your details.'
            });
        }

        res.json({
            success: true,
            data: member
        });

    } catch (error) {
        console.error('Error verifying membership:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during verification.'
        });
    }
});

// GET /api/membership/all - Fetch all membership records
router.get('/all', async (req, res) => {
    try {
        const members = await Membership.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: members
        });
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching members.'
        });
    }
});

// DELETE /api/membership/:id - Delete a member record by ID
router.delete('/:id', async (req, res) => {
    try {
        await Membership.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Member record deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting member record.' });
    }
});

module.exports = router;
