const express = require('express');
const router = express.Router();
const SwarojgaarGroup = require('../models/SwarojgaarRegisterSchema');
const { validateRequest } = require('../middleware/requestValidation');
const { swarojgaarCreateOrderSchema, swarojgaarRegisterSchema, paymentVerifySchema } = require('../utils/routeSchemas');
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

// --- Multer Setup for Member Photos ---
// फोल्डर सुनिश्चित करें
const uploadDir = path.join(__dirname, '..', 'uploads', 'swarojgaar');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

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

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        // Sanitized filename
        const sanitized = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        cb(null, 'member-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + sanitized);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
    fileFilter: fileFilter
});

// ==========================================
//              API ROUTES
// ==========================================

// ✅ 0. CREATE ORDER - Razorpay Payment Initiation
router.post('/create-order', upload.any(), validateRequest({ body: swarojgaarCreateOrderSchema }), async (req, res) => {
    try {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("RAZORPAY configuration missing in .env file");
            return res.status(500).json({ success: false, message: "Payment gateway not configured. Please contact administrator." });
        }

        const {
            village, panchayat, anumandal, district, groupName, registrationFee, members, registeredBy
        } = req.body;

        // ✅ Basic Validation
        if (!groupName || !village || !panchayat || !anumandal || !district) {
            return res.status(400).json({ success: false, message: "Required fields are missing." });
        }

        const orderId = "SWRJGR" + Date.now();

        // ✅ Parse members and store temporarily
        let membersData = [];
        try {
            membersData = req.body.members ? JSON.parse(req.body.members) : [];
        } catch (e) {
            console.error("JSON Parse Error:", e);
            return res.status(400).json({ success: false, message: "Invalid members data format" });
        }

        // ✅ Create group object BUT DON'T SAVE to DB yet
        const newGroup = new SwarojgaarGroup({
            location: {
                village: village || "",
                panchayat: panchayat || "",
                subDivision: anumandal || "",
                district: district || ""
            },
            groupName,
            members: membersData.map((m) => {
                const detailsParts = m.details ? m.details.split('|').map(s => s.trim()) : [];
                const photoFile = req.files.find(f => f.fieldname === `member_photo_${m.index}`);
                return {
                    fullName: m.name || "", 
                    address: m.address || "",
                    aadharCard: detailsParts[0] || "",
                    panCard: detailsParts[1] || "",
                    mobileNumber: detailsParts[2] || "",
                    photoUrl: photoFile ? `/uploads/swarojgaar/${photoFile.filename}` : ""
                };
            }).filter(m => m.fullName.trim() !== ""),
            termsAccepted: true,
            paymentStatus: 'Pending',
            registrationFee: registrationFee ? parseInt(registrationFee) : 100,
            orderId: orderId,
            registeredBy: registeredBy || 'Self'
        });

        console.log("Group prepared (NOT saved to DB yet):", orderId);

        // ✅ Store group data in MongoDB (TTL 60 minutes)
        try {
            const groupData = newGroup.toObject ? newGroup.toObject() : newGroup;
            await PendingPayment.create({
                orderId: orderId,
                paymentType: 'swarojgaar',
                data: groupData
            });
            console.log("✅ Group stored in MongoDB pending collection");
        } catch (storeError) {
            console.error("❌ Error storing group in MongoDB:", storeError);
            return res.status(500).json({ success: false, message: "Failed to store payment data" });
        }

        const finalAmount = registrationFee ? parseInt(registrationFee, 10) : 100;
        const razorpayOrder = await razorpay.orders.create({
            amount: finalAmount * 100,
            currency: 'INR',
            receipt: orderId,
            notes: {
                paymentType: 'swarojgaar',
                pendingOrderId: orderId,
                groupName: groupName || '',
                village: village || ''
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

// ✅ 1. VERIFY RAZORPAY PAYMENT & SAVE DATA ONLY ON SUCCESS
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

        const pendingRecord = await PendingPayment.findOne({ 
            orderId: pendingOrderId,
            paymentType: 'swarojgaar'
        });
        
        if (!pendingRecord) {
            return res.status(404).json({ success: false, message: 'Pending order not found' });
        }

        const groupData = pendingRecord.data;

        try {
            await PaymentLog.create({
                orderId: pendingOrderId,
                amount: groupData.registrationFee || 0,
                status: 'success',
                paymentId: razorpay_payment_id,
                transactionId: razorpay_order_id,
                schemeType: 'swarojgaar',
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                rawResponse: req.body,
                verificationStatus: 'verified',
                amountVerified: true,
                signatureVerified: true
            });
        } catch (logError) {
            console.warn('PaymentLog write failed (swarojgaar):', logError.message);
        }
        groupData.paymentStatus = 'Paid';
        groupData.paymentId = razorpay_payment_id;
        groupData.orderId = pendingOrderId;

        const newGroup = new SwarojgaarGroup(groupData);
        await newGroup.save();
        await PendingPayment.deleteOne({ orderId: pendingOrderId });

        return res.json({ success: true, orderId: pendingOrderId, paymentId: razorpay_payment_id });
    } catch (error) {
        console.error("Payment Verification Error:", error);
        return res.status(500).json({ success: false, message: 'Payment verification failed' });
    }
});

// 2. Register New Group (POST)
router.post('/register', upload.any(), validateRequest({ body: swarojgaarRegisterSchema }), async (req, res) => {
    try {
        // 1. Extract flat fields from req.body (Frontend sends them separately)
        const { 
            village, panchayat, anumandal, district, groupName, registeredBy,
            paymentId, paymentStatus, registrationFee // ✅ Receive Payment Details
        } = req.body;

        // 2. Construct Location Object manually
        const location = {
            village: village || "",
            panchayat: panchayat || "",
            subDivision: anumandal || "", // Map anumandal to subDivision
            district: district || ""
        };

        if (!groupName) {
            return res.status(400).json({ success: false, message: "Group Name is required." });
        }

        // 3. Process Members
        // Parse members JSON string from frontend
        let membersData = [];
        try {
            membersData = req.body.members ? JSON.parse(req.body.members) : [];
        } catch (e) {
            console.error("JSON Parse Error:", e);
            return res.status(400).json({ success: false, message: "Invalid members data format" });
        }

        const processedMembers = membersData.map((m) => {
            // Parse details string: "Aadhar | Pan | Mobile"
            const detailsParts = m.details ? m.details.split('|').map(s => s.trim()) : [];
            
            // Handle Photo: Frontend sends field name `member_photo_${index}`
            const photoFile = req.files.find(f => f.fieldname === `member_photo_${m.index}`);
            
            return {
                fullName: m.name || "", 
                address: m.address || "",
                aadharCard: detailsParts[0] || "",
                panCard: detailsParts[1] || "",
                mobileNumber: detailsParts[2] || "",
                photoUrl: photoFile ? `/uploads/swarojgaar/${photoFile.filename}` : ""
            };
        }).filter(m => m.fullName.trim() !== ""); // Filter out empty rows based on Name

        // 3. डेटाबेस में सेव करें
        const newGroup = new SwarojgaarGroup({
            location,
            groupName,
            members: processedMembers,
            termsAccepted: true,
            registeredBy: registeredBy || 'Admin/Self',
            
            // ✅ Payment Info Save
            paymentStatus: paymentId ? 'Paid' : (paymentStatus || 'Pending'),
            paymentId: paymentId || '',
            registrationFee: registrationFee ? parseInt(registrationFee) : 100 // Default Fee
        });

        await newGroup.save();

        res.json({
            success: true,
            message: "Swarojgaar Group Registered & Payment Recorded Successfully!",
            data: newGroup
        });

    } catch (error) {
        console.error("Swarojgaar Registration Error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Group Name already exists!" });
        }
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
});

// 2. Get Group by Order ID (For Print Receipt)
router.get('/get-by-order/:orderId', async (req, res) => {
    try {
        const { paymentId } = req.query;
        let group = await SwarojgaarGroup.findOne({ orderId: req.params.orderId });
        if (!group && paymentId) {
            group = await SwarojgaarGroup.findOne({ paymentId });
        }
        if (group) {
            res.json({ success: true, data: group });
        } else {
            res.json({ success: false, message: "Group not found" });
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ success: false, message: "Error fetching group data" });
    }
});

// 3. Get All Groups (GET) - Admin Dashboard के लिए
router.get('/all-groups', async (req, res) => {
    try {
        const groups = await SwarojgaarGroup.find().sort({ createdAt: -1 });
        res.json({ success: true, count: groups.length, data: groups });
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ success: false, message: "Error fetching groups" });
    }
});





// ✅ 4. Delete Group (DELETE) - Admin Dashboard के लिए
router.delete('/delete/:id', async (req, res) => {
    try {
        const deletedGroup = await SwarojgaarGroup.findByIdAndDelete(req.params.id);
        if (!deletedGroup) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }
        res.json({ success: true, message: 'Group and its members deleted successfully' });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ success: false, message: "Error deleting group" });
    }
});

module.exports = router;
