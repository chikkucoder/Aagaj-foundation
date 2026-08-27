const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const upload = require('../middleware/upload');
const Membership = require('../models/MembershipSchema');

const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Middleware to verify session (allows either Admin JWT or employee token/session)
const verifyAdminOrEmployee = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ success: false, message: "Access Denied. No Token Provided." });

    const tokenVal = token.replace("Bearer ", "");
    if (tokenVal === 'employee-session') {
        req.user = { role: 'employee' };
        return next();
    }

    try {
        const verified = jwt.verify(tokenVal, process.env.JWT_SECRET);
        req.user = verified;
        if (verified.role !== 'admin' && verified.role !== 'employee') {
            return res.status(403).json({ success: false, message: "Access Denied. Unauthorized Role." });
        }
        next();
    } catch (err) {
        res.status(400).json({ success: false, message: "Invalid Token" });
    }
};

// Utility to generate unique Membership ID & Certificate No
const generateMembershipIds = async () => {
    const year = new Date().getFullYear();
    
    // Find the last membership created in the CURRENT year
    const lastMember = await Membership.findOne({ 
        membershipId: new RegExp(`^AF-MBR-${year}-`) 
    }).sort({ _id: -1 });

    let nextSeq = 1;
    if (lastMember && lastMember.membershipId) {
        const parts = lastMember.membershipId.split('-');
        if (parts.length >= 4) {
            const lastNum = parseInt(parts[3], 10);
            if (!isNaN(lastNum)) {
                nextSeq = lastNum + 1;
            }
        }
    }

    // Safety loop to ensure 100% uniqueness
    let sequenceNum = nextSeq;
    let membershipId = '';
    let certificateNo = '';
    let isUnique = false;

    while (!isUnique) {
        const sequence = String(sequenceNum).padStart(5, '0');
        membershipId = `AF-MBR-${year}-${sequence}`;
        certificateNo = `AF/MBR/${year}/${sequence}`;

        const existing = await Membership.findOne({
            $or: [{ membershipId }, { certificateNo }]
        });

        if (!existing) {
            isUnique = true;
        } else {
            sequenceNum++;
        }
    }

    return { membershipId, certificateNo };
};

// 1. POST /api/membership/create-order - Create Razorpay Order
router.post('/create-order', async (req, res) => {
    try {
        const { paymentAmount, fullName, mobileNumber } = req.body;
        const numericAmount = Number(paymentAmount);

        if (!numericAmount || isNaN(numericAmount) || numericAmount < 1) {
            return res.status(400).json({ success: false, message: 'Please enter a valid payment amount.' });
        }

        const orderOptions = {
            amount: Math.round(numericAmount * 100), // paise
            currency: 'INR',
            receipt: `rcpt_mbr_${Date.now()}`,
            notes: {
                applicant_name: fullName || 'Member',
                mobile: mobileNumber || ''
            }
        };

        const order = await razorpay.orders.create(orderOptions);

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Error creating Razorpay order for membership:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create payment order.'
        });
    }
});

// 2. POST /api/membership/verify-payment - Verify HMAC signature & save record
router.post('/verify-payment', async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            formData
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !formData) {
            return res.status(400).json({ success: false, message: 'Missing payment details or form data.' });
        }

        // Verify Razorpay HMAC Signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed. Invalid transaction signature.'
            });
        }

        // Signature valid - Check if payment already processed (Idempotency check)
        const existingPayment = await Membership.findOne({ paymentId: razorpay_payment_id });
        if (existingPayment) {
            return res.status(200).json({
                success: true,
                message: 'Payment already verified and Membership registered successfully!',
                data: existingPayment
            });
        }

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
            paymentAmount
        } = formData;

        if (!fullName || !fullName.trim()) {
            return res.status(400).json({ success: false, message: 'Full Name is required.' });
        }
        if (!mobileNumber || !mobileNumber.trim()) {
            return res.status(400).json({ success: false, message: 'Mobile Number is required.' });
        }

        const numericAmount = Number(paymentAmount);

        // Attempt save with retry logic in case of concurrent duplicate key race conditions
        let savedMember;
        let attempts = 0;
        while (attempts < 3) {
            try {
                const { membershipId, certificateNo } = await generateMembershipIds();

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
                    paymentId: razorpay_payment_id,
                    orderId: razorpay_order_id,
                    certificateIssued: true
                });

                savedMember = await newMember.save();
                break;
            } catch (saveError) {
                if (saveError.code === 11000) {
                    attempts++;
                    if (attempts >= 3) throw saveError;
                } else {
                    throw saveError;
                }
            }
        }

        res.status(201).json({
            success: true,
            message: 'Payment verified and Membership registered successfully!',
            data: savedMember
        });

    } catch (error) {
        console.error('Error verifying membership payment:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during payment verification.'
        });
    }
});

const { requestOtpSession, verifyOtpSession } = require('../services/otpService');

// POST /api/membership/request-otp - Request OTP for Membership Lookup / Certificate Download
router.post('/request-otp', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query || !query.trim()) {
            return res.status(400).json({ success: false, message: 'Please enter Membership ID, Certificate No, Mobile, or Aadhaar.' });
        }

        const trimmed = query.trim();
        const member = await Membership.findOne({
            $or: [
                { membershipId: trimmed },
                { certificateNo: trimmed },
                { mobileNumber: trimmed },
                { aadhaarNumber: trimmed }
            ]
        }).lean();

        if (!member) {
            return res.status(404).json({ success: false, message: 'No membership record found matching your details.' });
        }

        if (!member.mobileNumber) {
            return res.status(400).json({ success: false, message: 'No mobile number associated with this membership record.' });
        }

        const otpResult = await requestOtpSession({
            identifier: member.membershipId || member.mobileNumber,
            scope: 'membership',
            mobile: member.mobileNumber,
            metadata: {
                memberId: member._id,
                membershipId: member.membershipId,
                fullName: member.fullName,
                mobileNumber: member.mobileNumber
            }
        });

        if (otpResult.rateLimited) {
            return res.status(429).json({ success: false, ...otpResult });
        }

        res.json({
            success: true,
            ...otpResult,
            membershipId: member.membershipId
        });
    } catch (error) {
        console.error('Membership Request OTP Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/membership/verify-otp - Verify OTP and Return Member Record
router.post('/verify-otp', async (req, res) => {
    try {
        const { sessionId, otp } = req.body;
        if (!sessionId || !otp) {
            return res.status(400).json({ success: false, message: 'Missing required parameters (sessionId, otp).' });
        }

        const verifyResult = await verifyOtpSession({
            sessionId,
            scope: 'membership',
            otp
        });

        if (!verifyResult.success) {
            return res.status(400).json(verifyResult);
        }

        const memberId = verifyResult.metadata?.memberId;
        const member = await Membership.findById(memberId).lean();

        res.json({
            success: true,
            message: 'Membership OTP verified successfully!',
            accessToken: verifyResult.accessToken,
            data: member
        });
    } catch (error) {
        console.error('Membership Verify OTP Error:', error);
        res.status(500).json({ success: false, message: error.message });
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

// PUT /api/membership/admin/edit/:id - Edit membership record & photo
router.put('/admin/edit/:id', verifyAdminOrEmployee, upload.single('photo'), async (req, res) => {
    try {
        const { id } = req.params;
        const member = await Membership.findById(id);
        if (!member) {
            return res.status(404).json({ success: false, message: "Membership record not found!" });
        }

        const {
            fullName,
            fatherOrHusbandName,
            dobOrAge,
            gender,
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
            paymentAmount,
            paymentStatus,
            certificateNo
        } = req.body;

        if (fullName) member.fullName = fullName.trim();
        if (fatherOrHusbandName !== undefined) member.fatherOrHusbandName = fatherOrHusbandName.trim();
        if (dobOrAge !== undefined) member.dobOrAge = dobOrAge.trim();
        if (gender !== undefined) member.gender = gender.trim();

        if (mobileNumber) member.mobileNumber = mobileNumber.trim();
        if (email !== undefined) member.email = email.trim().toLowerCase();

        if (address !== undefined) member.address = address.trim();
        if (city !== undefined) member.city = city.trim();
        if (district !== undefined) member.district = district.trim();
        if (state !== undefined) member.state = state.trim();
        if (pincode !== undefined) member.pincode = pincode.trim();

        if (aadhaarNumber !== undefined) member.aadhaarNumber = aadhaarNumber.trim();
        if (panNumber !== undefined) member.panNumber = panNumber.trim().toUpperCase();

        if (occupation !== undefined) member.occupation = occupation.trim();
        if (organization !== undefined) member.organization = organization.trim();
        if (membershipType !== undefined) member.membershipType = membershipType;
        if (joiningDate !== undefined) member.joiningDate = joiningDate;

        if (interestAreas !== undefined) {
            try {
                member.interestAreas = Array.isArray(interestAreas) ? interestAreas : JSON.parse(interestAreas);
            } catch (e) {
                if (typeof interestAreas === 'string') {
                    member.interestAreas = interestAreas.split(',').map(s => s.trim()).filter(Boolean);
                }
            }
        }

        if (paymentAmount !== undefined && !isNaN(paymentAmount)) {
            member.paymentAmount = Number(paymentAmount);
        }
        if (paymentStatus !== undefined) member.paymentStatus = paymentStatus;
        if (certificateNo !== undefined && certificateNo.trim()) member.certificateNo = certificateNo.trim();

        if (req.file) {
            member.photoUrl = req.file.path;
        }

        await member.save();

        res.json({
            success: true,
            message: "Membership details updated successfully!",
            data: member
        });
    } catch (error) {
        console.error("Admin Edit Membership Error:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to update membership record." });
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
