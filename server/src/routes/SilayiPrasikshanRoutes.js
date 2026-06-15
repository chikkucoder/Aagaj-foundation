// d:\Agaz foundation\Silai_Swarojgaar_Swasthya_RegisterRoutes.js

const express = require('express');
const router = express.Router();
const Beneficiary = require('../models/SilayiPrasikshanSchema');
const { validateRequest } = require('../middleware/requestValidation');
const { silayiCreateOrderSchema, silayiRegisterSchema, paymentVerifySchema } = require('../utils/routeSchemas');
const PendingPayment = require('../models/PendingPayment');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Razorpay = require('razorpay');

const PaymentLog = require('../models/PaymentLog');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// --- Multer Setup for Photo Upload ---
const uploadDir = path.join(__dirname, '..', 'uploads');
try {
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (err) {
    console.warn('⚠️ Could not create uploads directory in Vercel:', err.message);
}

//✅ FILE FILTER - Only Images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, JPG, PNG, GIF) are allowed!'));
    }
};

const upload = require('../middleware/upload');

// ==========================================
//              API ROUTES
// ==========================================

// ✅ 0. CREATE ORDER - Razorpay Payment Initiation
router.post('/create-order', upload.single('photo'), validateRequest({ body: silayiCreateOrderSchema }), async (req, res) => {
    try {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("RAZORPAY configuration missing in .env file");
            return res.status(500).json({ success: false, message: "Payment gateway not configured. Please contact administrator." });
        }

        const {
            serialNumber, name, guardianName, address, mobileNumber,
            gender, email, aadharNumber, age, caste, trainingName,
            existingSkills, trainingDuration, trainingDate, registeredBy
        } = req.body;

        // ✅ Basic Validation
        if (!name || !mobileNumber || !aadharNumber) {
            return res.status(400).json({ success: false, message: "Required fields (Name, Mobile, Aadhar) are missing." });
        }

        // ✅ Check Duplicate Aadhar
        const existingUser = await Beneficiary.findOne({ aadharNumber });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "This Aadhar Number is already registered!" });
        }

        // const orderId = "SILAYI" + Date.now();

        // // ✅ Create beneficiary object BUT DON'T SAVE to DB yet
        // const newBeneficiary = new Beneficiary({
        //     yojanaName: 'Mahila Silai Prasikshan Yojana',
        //     serialNumber,
        //     name,
        //     guardianName,
        //     address,
        //     mobileNumber,
        //     gender,
        //     email,
        //     aadharNumber,
        //     age,
        //     caste,
        //     trainingName,
        //     existingSkills,
        //     trainingDuration,
        //     trainingDate: trainingDate || new Date().toLocaleDateString('en-IN'),
        //     photoUrl: req.file ? `/uploads/${req.file.filename}` : '',
        //     paymentStatus: 'Pending',
        //     registrationFee: 799,
        //     orderId: orderId
        // });

        // console.log("Beneficiary prepared (NOT saved to DB yet):", orderId);



        const orderId = "SILAYI" + Date.now();

        // ✅ 1. Generate Year-Wise Auto-Increment Serial Number (e.g., 2600001)
        const currentYear = new Date().getFullYear().toString().slice(-2); // Gets "26" for 2026
        
        // Find the last beneficiary registered THIS year
        const lastBeneficiary = await Beneficiary.findOne({ 
            serialNumber: new RegExp(`^${currentYear}`) 
        }).sort({ _id: -1 });

        let nextSerial = `${currentYear}00001`; // Default starting ID for the year

        if (lastBeneficiary && lastBeneficiary.serialNumber) { 
            // Extract the numeric part after the year (e.g., from "2600001" extract "00001")
            const lastNumStr = lastBeneficiary.serialNumber.substring(2);
            const lastNum = parseInt(lastNumStr, 10);
            
            if (!isNaN(lastNum)) {
                // Increment and pad with leading zeros to maintain 5 digits after the year
                nextSerial = `${currentYear}${(lastNum + 1).toString().padStart(5, '0')}`; 
            }
        }

        // ✅ 2. Create beneficiary object BUT DON'T SAVE to DB yet
        const newBeneficiary = new Beneficiary({
            yojanaName: 'Mahila Silai Prasikshan Yojana',
            serialNumber: nextSerial, // <--- Using the newly generated backend serial!
            name,
            guardianName,
            address,
            mobileNumber,
            gender,
            email,
            aadharNumber,
            age,
            caste,
            trainingName,
            existingSkills,
            trainingDuration,
            trainingDate: trainingDate || new Date().toLocaleDateString('en-IN'),
            photoUrl: req.file ? req.file.path : '',
            paymentStatus: 'Pending',
            registrationFee: 799,
            orderId: orderId,
            registeredBy: registeredBy || 'Self'  // ✅ Add this line
        });

        console.log("Beneficiary prepared (NOT saved to DB yet):", orderId, "with Serial:", nextSerial);

        // ✅ Store beneficiary data in MongoDB (TTL 60 minutes)
        try {
            const benData = newBeneficiary.toObject ? newBeneficiary.toObject() : newBeneficiary;
            await PendingPayment.create({
                orderId: orderId,
                paymentType: 'silayi',
                data: benData
            });
            console.log("✅ Beneficiary stored in MongoDB:", orderId);
        } catch (storeError) {
            console.error("❌ Error storing beneficiary:", storeError);
            return res.status(500).json({ success: false, message: "Failed to store payment data" });
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: 79900,
            currency: 'INR',
            receipt: orderId,
            notes: {
                paymentType: 'silayi',
                pendingOrderId: orderId,
                name: name || '',
                mobile: mobileNumber || ''
            }
        });

        return res.status(200).json({
            success: true,
            orderId: razorpayOrder.id,
            pendingOrderId: orderId,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error("Create Order Error:", error);
        console.error("Error Stack:", error.stack);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 1. Register New Beneficiary (After Payment Success)
router.post('/register', upload.single('photo'), validateRequest({ body: silayiRegisterSchema }), async (req, res) => {
    try {
        const {
            yojanaName, serialNumber, name, guardianName, address, mobileNumber,
            gender, email, aadharNumber, age, caste, trainingName,
            existingSkills, trainingDuration, trainingDate, 
            paymentStatus, registrationFee, registeredBy, orderId,
            paymentId // ✅ Receive Payment ID from Getepay callback
        } = req.body;

        // 1. Basic Validation
        if (!name || !mobileNumber || !aadharNumber) {
            return res.status(400).json({ success: false, message: "Required fields (Name, Mobile, Aadhar) are missing." });
        }

        // 2. Check Duplicate Aadhar
        const existingUser = await Beneficiary.findOne({ aadharNumber });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "This Aadhar Number is already registered!" });
        }

        // 3. Create New Entry
        const newBeneficiary = new Beneficiary({
            yojanaName: yojanaName || 'Mahila Silai Prasikshan Yojana',
            serialNumber,
            name,
            guardianName,
            address,
            mobileNumber,
            gender,
            email,
            aadharNumber,
            age,
            caste,
            trainingName,
            existingSkills,
            trainingDuration,
            trainingDate: trainingDate || new Date().toLocaleDateString('en-IN'),
            photoUrl: req.file ? req.file.path : '',
            
            // ✅ Payment Status: If paymentId exists (from Getepay), mark as Paid
            paymentStatus: paymentId ? 'Paid' : (paymentStatus || 'Pending'),
            registrationFee: registrationFee || 799,
            registeredBy: registeredBy || 'Admin/Self',
            orderId: orderId
        });

        await newBeneficiary.save();

        res.json({
            success: true,
            message: "Registration & Payment Successful!",
            data: newBeneficiary
        });

    } catch (error) {
        console.error("Scheme Registration Error:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
});

// ✅ 1.5 VERIFY RAZORPAY PAYMENT & SAVE DATA ONLY ON SUCCESS
router.post('/verify-payment', validateRequest({ body: paymentVerifySchema }), async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            pendingOrderId
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !pendingOrderId) {
            return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
        }

        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment signature verification failed' });
        }

        // ✅ LOG ALL PAYMENT ATTEMPTS
        try {
            await PaymentLog.create({
                orderId: pendingOrderId,
                amount: 799,
                status: 'success',
                paymentId: razorpay_payment_id,
                transactionId: razorpay_order_id,
                schemeType: 'silayi',
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                rawResponse: req.body,
                verificationStatus: 'verified',
                amountVerified: true,
                signatureVerified: true
            });
        } catch (logError) {
            console.error("⚠️ Payment logging failed:", logError.message);
        }

        const existingRecord = await Beneficiary.findOne({ orderId: pendingOrderId });
        if (existingRecord && existingRecord.paymentStatus === 'Paid') {
            return res.json({ success: true, orderId: pendingOrderId, paymentId: existingRecord.paymentId || razorpay_payment_id });
        }

        const pendingRecord = await PendingPayment.findOne({
            orderId: pendingOrderId,
            paymentType: 'silayi'
        });

        if (!pendingRecord) {
            return res.status(404).json({ success: false, message: 'Pending order not found' });
        }

        const pendingData = pendingRecord.data;
        pendingData.paymentStatus = 'Paid';
        pendingData.paymentId = razorpay_payment_id;
        pendingData.orderId = pendingOrderId;
        pendingData.paymentVerifiedAt = new Date();

        const newBen = new Beneficiary(pendingData);
        await newBen.save();
        await PendingPayment.deleteOne({ orderId: pendingOrderId });

        return res.json({ success: true, orderId: pendingOrderId, paymentId: razorpay_payment_id });
        
    } catch (error) {
        console.error('❌ Payment verification error:', error);
        return res.status(500).json({ success: false, message: 'Payment verification failed' });
    }
});

// 2. Get All Beneficiaries (For Admin Dashboard)
router.get('/all-beneficiaries', async (req, res) => {
    try {
        const { yojana } = req.query;
        let query = {};
        if (yojana) {
            query.yojanaName = yojana;
        }
        const list = await Beneficiary.find(query).sort({ createdAt: -1 });
        res.json({ success: true, count: list.length, data: list });
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ success: false, message: "Error fetching data" });
    }
});

// ✅ 2.1 Get Beneficiary by Order ID (For Print Receipt)
router.get('/get-by-order/:orderId', async (req, res) => {
    try {
        const beneficiary = await Beneficiary.findOne({ orderId: req.params.orderId });
        if (beneficiary) {
            res.json({ success: true, data: beneficiary });
        } else {
            res.json({ success: false, message: "Beneficiary not found" });
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ success: false, message: "Error fetching beneficiary data" });
    }
});

// ✅ Route: Public verify beneficiary by Aadhar, Mobile or Serial Number
router.get('/verify', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ success: false, message: "Aadhar, Mobile, or Reg Number is required." });
        }
        const cleanQuery = query.toString().trim();
        const b = await Beneficiary.findOne({
            $or: [
                { aadharNumber: cleanQuery },
                { mobileNumber: cleanQuery },
                { serialNumber: cleanQuery }
            ]
        });
        if (b) {
            res.json({ success: true, data: b });
        } else {
            res.json({ success: false, message: "Beneficiary registration not found." });
        }
    } catch (error) {
        console.error("Verify Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
