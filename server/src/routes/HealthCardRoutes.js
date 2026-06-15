const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Razorpay = require('razorpay');
const HealthCard = require('../models/HealthCardSchema');
const PendingPayment = require('../models/PendingPayment');
const PaymentLog = require('../models/PaymentLog');
const crypto = require('crypto');
const { sendSMS, sendWhatsApp } = require('../services/twilioService');
const { validateRequest } = require('../middleware/requestValidation');
const {
    healthCardCheckExistsSchema,
    healthCardCreateOrderSchema,
    healthCardVerifyPaymentSchema
} = require('../utils/routeSchemas');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ✅ FILE FILTER - Only Images
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

// ✅ API to Check if User Already Exists
router.post('/check-exists', validateRequest({ body: healthCardCheckExistsSchema }), async (req, res) => {
    try {
        const { mobile, aadhar } = req.body;
        
        let queryArr = [];
        if (mobile) queryArr.push({ mobile });
        if (aadhar) queryArr.push({ aadhar });

        if (queryArr.length === 0) return res.json({ exists: false });

        const existingUser = await HealthCard.findOne({ $or: queryArr });

        if (existingUser) {
            return res.json({ 
                exists: true, 
                message: "This contact number or aadhar number is already exist" 
            });
        }

        res.json({ exists: false });
    } catch (error) {
        console.error("Check Exists Error:", error);
        res.status(500).json({ exists: false, message: "Server Error" });
    }
});

// ✅ API to Create Payment Order (RAZORPAY)
router.post('/create-order', upload.single('photo'), validateRequest({ body: healthCardCreateOrderSchema }), async (req, res) => {
    try {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({ success: false, message: 'Payment gateway not configured. Please contact administrator.' });
        }

        const {
            fullName, mobile, aadhar, age, gender, bloodGroup,
            village, panchayat, block, district, state, pincode,
            registeredBy, cardType, familyMembers
        } = req.body;

        // 1. Validation
        if (!fullName || !mobile || !aadhar || !age) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        // 2. Check for duplicates
        const existingUser = await HealthCard.findOne({ $or: [{ mobile }, { aadhar }] });
        if (existingUser) {
            return res.json({ success: false, message: "Data already exists for this Mobile or Aadhar." });
        }

        // 3. Generate Order ID
        const orderId = `HLTHCRD${Date.now()}`;

        const resolvedCardType = cardType || 'Single';
        const finalAmount = resolvedCardType === 'Family' ? 499 : 201;

        let familyMembersParsed = [];
        if (resolvedCardType === 'Family' && familyMembers) {
            try {
                familyMembersParsed = typeof familyMembers === 'string' ? JSON.parse(familyMembers) : familyMembers;
            } catch (e) {
                console.error("Family members parsing failed:", e.message);
            }
        }

        // 4. Store pending data in MongoDB (TTL 60 minutes)
        await PendingPayment.create({
            orderId: orderId,
            paymentType: 'healthcard',
            data: {
                fullName, mobile, aadhar, age, gender, bloodGroup,
                village, panchayat, block, district, state, pincode,
                photoPath: req.file ? req.file.path : '',
                registeredBy: registeredBy || 'Self',
                cardType: resolvedCardType,
                familyMembers: familyMembersParsed,
                amount: finalAmount
            }
        });

        // 5. Create Razorpay order
        const order = await razorpay.orders.create({
            amount: finalAmount * 100,
            currency: 'INR',
            receipt: orderId,
            notes: {
                paymentType: 'healthcard',
                pendingOrderId: orderId,
                fullName: fullName || 'Health Card User',
                mobile: mobile || '',
                cardType: resolvedCardType
            }
        });

        return res.json({
            success: true,
            orderId: order.id,
            pendingOrderId: orderId,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
});

// ✅ API to Verify Payment Callback (RAZORPAY)
router.post('/verify-payment', validateRequest({ body: healthCardVerifyPaymentSchema }), async (req, res) => {
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

        // 3. Retrieve pending card data from MongoDB
        const pendingRecord = await PendingPayment.findOne({ 
            orderId: pendingOrderId,
            paymentType: 'healthcard'
        });

        if (!pendingRecord) {
            console.error('No pending health card found for order:', pendingOrderId);
            return res.status(404).json({ success: false, message: 'Pending order not found' });
        }

        const pendingCardData = pendingRecord.data;

        // 4. Generate Health ID
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        const healthId = `MC-${randomNum}`;

        // 5. Calculate Expiry Date (6 months)
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 6);

        // 6. Save to Database
        const newCard = new HealthCard({
            healthId,
            fullName: pendingCardData.fullName,
            mobile: pendingCardData.mobile,
            aadhar: pendingCardData.aadhar,
            age: pendingCardData.age,
            gender: pendingCardData.gender,
            bloodGroup: pendingCardData.bloodGroup,
            address: {
                village: pendingCardData.village,
                panchayat: pendingCardData.panchayat,
                block: pendingCardData.block,
                district: pendingCardData.district,
                state: pendingCardData.state,
                pincode: pendingCardData.pincode
            },
            photoPath: pendingCardData.photoPath,
            cardType: pendingCardData.cardType || 'Single',
            familyMembers: pendingCardData.familyMembers || [],
            paymentId: razorpay_payment_id,
            orderId: pendingOrderId,
            amount: pendingCardData.amount || 201,
            paymentStatus: 'Paid',
            expiryDate,
            registeredBy: pendingCardData.registeredBy || 'Self'
        });

        await newCard.save();

        // 🟢 Send SMS & WhatsApp Notification for Health Card
        let notificationResults = null;
        const cardTypeTitle = (pendingCardData.cardType || 'Single') === 'Family' ? 'Family Health Card' : 'Health Card';
        const healthCardMsg = `Dear ${pendingCardData.fullName}, your payment was successful! Your ${cardTypeTitle} ID is ${healthId}. It is valid until ${expiryDate.toLocaleDateString('en-IN')}. Thank you!`;
        if (pendingCardData.mobile) {
            const [smsResult, waResult] = await Promise.all([
                sendSMS(pendingCardData.mobile, healthCardMsg),
                sendWhatsApp(pendingCardData.mobile, healthCardMsg)
            ]);
            notificationResults = {
                sms: smsResult,
                whatsapp: waResult
            };
            console.log('Health card notification results:', {
                phone: pendingCardData.mobile,
                sms: smsResult,
                whatsapp: waResult
            });
        }

        try {
            await PaymentLog.create({
                orderId: pendingOrderId,
                amount: pendingCardData.amount || 201,
                status: 'success',
                paymentId: razorpay_payment_id,
                transactionId: razorpay_order_id,
                schemeType: 'healthcard',
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                rawResponse: req.body,
                verificationStatus: 'verified',
                amountVerified: true,
                signatureVerified: true
            });
        } catch (logError) {
            console.warn('PaymentLog write failed (healthcard):', logError.message);
        }

        // 7. Clean up pending record from MongoDB
        await PendingPayment.deleteOne({ orderId: pendingOrderId });

        const responsePayload = {
            success: true,
            orderId: pendingOrderId,
            paymentId: razorpay_payment_id,
            redirectUrl: `${process.env.FRONTEND_URL}/healthcard.html?status=success&orderId=${encodeURIComponent(pendingOrderId)}&paymentId=${encodeURIComponent(razorpay_payment_id)}`
        };

        if (process.env.NODE_ENV !== 'production') {
            responsePayload.notificationResults = notificationResults;
        }

        return res.json(responsePayload);

    } catch (error) {
        console.error("Verify Payment Error:", error);
        return res.status(500).json({ success: false, message: 'Payment verification failed' });
    }
});

// ✅ API to Fetch Card Data by Order ID (for print restoration)
router.get('/get-by-order/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentId } = req.query;

        let card = await HealthCard.findOne({ orderId });

        // Fallback: try paymentId if orderId not found
        if (!card && paymentId) {
            card = await HealthCard.findOne({ paymentId });
        }

        if (!card) {
            return res.json({ success: false, message: "Card not found" });
        }

        res.json({ success: true, data: card });
    } catch (error) {
        console.error("Get Card Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// ✅ API to Verify and Fetch Health Card by Health ID (for user verification and download)
router.get('/verify/:healthId', async (req, res) => {
    try {
        const input = String(req.params.healthId || '').trim();
        const upper = input.toUpperCase();
        const candidates = new Set([input, upper]);

        if (/^\d{6}$/.test(input)) {
            candidates.add(`MC-${input}`);
        }

        const match = upper.match(/^MC-(\d{6})$/);
        if (match) {
            candidates.add(match[1]);
        }

        const candidateArray = Array.from(candidates).filter(Boolean);

        const card = await HealthCard.findOne({ healthId: { $in: candidateArray } }).lean();

        if (!card) {
            return res.status(404).json({ success: false, message: 'Health ID not found. Please check your card number.' });
        }

        res.json({ success: true, data: card });
    } catch (error) {
        console.error("Verify Health Card ID Error:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
});

// ✅ API to get all health cards for Admin Dashboard
router.get('/all', async (req, res) => {
    try {
        // Add authentication check here if needed for admin routes
        const allCards = await HealthCard.find().sort({ createdAt: -1 }); // Sort by newest
        res.json({ success: true, data: allCards });
    } catch (error) {
        console.error("Get All Health Cards Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;
