const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const Donation = require('../models/DonationSchema'); 
const { validateRequest } = require('../middleware/requestValidation');
const { createDonationOrderSchema, verifyDonationSchema } = require('../utils/routeSchemas');

// ✅ Utilities for Getepay Encryption
// const { encryptEas } = require('./utils/encryptEas'); 
// const { decryptEas } = require('./utils/decryptEas'); 

// require('dotenv').config();

// // Getepay Configuration from .env
// const config = {
//     GetepayMid: process.env.GETEPAY_MID,
//     GetepayTerminalId: process.env.GETEPAY_TERMINAL_ID,
//     GetepayKey: process.env.GETEPAY_KEY,
//     GetepayIV: process.env.GETEPAY_IV,
//     GetepayUrl: process.env.GETEPAY_URL,
// };

const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// 1. Initiate Getepay Payment
// router.post('/create-donation-order', async (req, res) => {
//     try {
//         const { amount, donorData } = req.body;

//         if (!amount || amount < 1) {
//             return res.status(400).json({ message: "Invalid Amount" });
//         }

//         const data = {
//             mid: config.GetepayMid,
//             amount: parseFloat(amount).toFixed(2), // Requirements: Two decimal places
//             merchantTransactionId: "AGZ" + Date.now(),
//             transactionDate: new Date().toString(),
//             terminalId: config.GetepayTerminalId,
//             udf1: donorData.name || "Anonymous",
//             udf2: donorData.email || "",
//             udf3: donorData.phone || "",
//             udf4: donorData.address || "",
//             udf5: donorData.pan || "",
//             udf6: donorData.state || "",
//             udf7: donorData.city || "",
//             udf8: donorData.pincode || "",
//             ru: process.env.FRONTEND_URL + "/donation/verify-donation", // Your Return URL
//             callbackUrl: process.env.FRONTEND_URL + "/donation/verify-donation",
//             currency: "INR",
//             paymentMode: "ALL",
//             txnType: "single",
//             productType: "IPG",
//             txnNote: "Donation to Aagaj Foundation",
//             vpa: config.GetepayTerminalId,
//         };

//         const JsonData = JSON.stringify(data);
//         const ciphertext = encryptEas(JsonData, config.GetepayKey, config.GetepayIV).toUpperCase();

//         const gatewayUrls = [
//             config.GetepayUrl,
//             process.env.GETEPAY_URL_FALLBACK,
//             'https://pay1.getepay.in/getepayPortal/pg/generateInvoice'
//         ].filter(Boolean);

//         let result = null;
//         let lastGatewayError = null;

//         for (const gatewayUrl of gatewayUrls) {
//             try {
//                 const response = await fetch(gatewayUrl, {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({
//                         mid: data.mid,
//                         terminalId: data.terminalId,
//                         req: ciphertext,
//                     }),
//                 });

//                 const responseText = await response.text();
//                 const parsed = JSON.parse(responseText);

//                 if (!response.ok) {
//                     throw new Error(`Gateway HTTP ${response.status}`);
//                 }

//                 result = parsed;
//                 break;
//             } catch (gatewayError) {
//                 lastGatewayError = gatewayError;
//                 console.warn(`Donation gateway attempt failed on ${gatewayUrl}:`, gatewayError.message);
//             }
//         }

//         if (!result) {
//             throw new Error(lastGatewayError ? lastGatewayError.message : 'All payment gateway attempts failed');
//         }

//         if (!result.response) {
//             throw new Error('GETEPAY API did not return encrypted response');
//         }

//         const decryptedResponse = decryptEas(result.response, config.GetepayKey, config.GetepayIV);
//         const parsedData = JSON.parse(decryptedResponse);

//         if (!parsedData.paymentUrl) {
//             throw new Error('Payment URL missing in gateway response');
//         }

//         res.json({ 
//             success: true, 
//             paymentUrl: parsedData.paymentUrl 
//         });

//     } catch (error) {
//         console.error("Initiation Error:", error);
//         res.status(500).json({ message: "Failed to initiate gateway" });
//     }
// });

router.post('/create-donation-order', validateRequest({ body: createDonationOrderSchema }), async (req, res) => {
    try {
        const { amount, donorData } = req.body;

        if (!amount || amount < 1) {
            return res.status(400).json({ message: "Invalid Amount" });
        }

        // 1️⃣ Create Razorpay Order
        const orderData = {
            amount: parseFloat(amount) * 100, // Razorpay uses smallest currency unit (paise)
            currency: "INR",
            receipt: "receipt_" + Date.now(),
            notes: {
                donor_name: donorData.name || "Anonymous",
                donor_email: donorData.email || "",
                donor_phone: donorData.phone || "",
                donor_address: donorData.address || "",
                donor_pan: donorData.pan || "",
                donor_state: donorData.state || "",
                donor_city: donorData.city || "",
                donor_pincode: donorData.pincode || ""
            }
        };

        const order = await razorpay.orders.create(orderData);

        if (!order.id) {
            throw new Error('Failed to create Razorpay order');
        }

        res.json({ 
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID // Frontend को key भेजो
        });

    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(500).json({ message: "Failed to create order" });
    }
});




// // 2. Handle Getepay Success/Failure Redirect
// router.all('/verify-donation', async (req, res) => {
//     try {
//         const encryptedResult = req.body.response || req.body.encData || req.query.response || req.query.encData;

//         if (!encryptedResult) {
//             return res.status(400).send("Invalid response from gateway");
//         }

//         const decryptedData = decryptEas(encryptedResult, config.GetepayKey, config.GetepayIV);
        
//         // Data format fix
//         let parsedData = JSON.parse(decryptedData);
//         if (typeof parsedData === 'string') {
//             parsedData = JSON.parse(parsedData);
//         }

//         // Safely check status
//         const isSuccess = (parsedData.txnStatus && parsedData.txnStatus.toUpperCase() === 'SUCCESS') || 
//                           (parsedData.paymentStatus && parsedData.paymentStatus.toUpperCase() === 'SUCCESS');

//         if (isSuccess) {
//             try {
//                 const newDonation = new Donation({
//                     payment_id: parsedData.getepayTxnId || "N/A",
//                     order_id: parsedData.merchantOrderNo || "N/A", 
//                     amount: parsedData.txnAmount || 0,
//                     donor_name: parsedData.udf1 || "Anonymous",
//                     email: parsedData.udf2 || "N/A",
//                     phone: parsedData.udf3 || "N/A",
//                     address: parsedData.udf4 || "N/A",
//                     state: parsedData.udf6 || "N/A",
//                     pan: parsedData.udf5 || "N/A",
//                     city: parsedData.udf7 || "",
//                     pincode: parsedData.udf8 || "",
//                     status: 'Success'
//                 });

//                 await newDonation.save();
//                 return res.redirect('/donation-success.html'); 
                
//             } catch (dbError) {
//                 console.error("Donation Save Error:", dbError);
//                 return res.redirect('/donation-failed.html'); 
//             }
//         } else {
//             return res.redirect('/donation-failed.html');
//         }
//     } catch (error) {
//         console.error("Verification System Error:", error.message);
//         return res.status(500).send("System Error: " + error.message);
//     }
// });

// // 3. Donation History
// router.get('/get-history', async (req, res) => {
//     try {
//         const donations = await Donation.find().sort({ date: -1 });
//         res.json(donations);
//     } catch (error) {
//         res.status(500).json({ message: "Server Error" });
//     }
// });

router.post('/verify-donation', validateRequest({ body: verifyDonationSchema }), async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donorData } = req.body;

        // 1️⃣ Verify Razorpay Signature
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ 
                success: false, 
                message: "Payment signature verification failed" 
            });
        }

        // 2️⃣ Signature valid - Save to Database
        try {
            const newDonation = new Donation({
                payment_id: razorpay_payment_id,
                order_id: razorpay_order_id,
                amount: req.body.amount / 100, // Convert paise to rupees
                donor_name: donorData.name || "Anonymous",
                email: donorData.email || "N/A",
                phone: donorData.phone || "N/A",
                address: donorData.address || "N/A",
                state: donorData.state || "N/A",
                pan: donorData.pan || "N/A",
                city: donorData.city || "",
                pincode: donorData.pincode || "",
                status: 'Success'
            });

            await newDonation.save();
            return res.json({ 
                success: true, 
                message: "Donation recorded successfully",
                paymentId: razorpay_payment_id 
            });
            
        } catch (dbError) {
            console.error("Donation Save Error:", dbError);
            return res.status(500).json({ 
                success: false,
                message: "Payment verified but failed to save" 
            });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ 
            success: false,
            message: "Verification failed" 
        });
    }
});

// Donation history for admin panel
router.get('/get-history', async (req, res) => {
    try {
        const donations = await Donation.find().sort({ date: -1 });
        res.json(donations);
    } catch (error) {
        console.error('Get donation history error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Public lookup used by donation success page to render downloadable receipt/certificate.
router.get('/receipt/:paymentId', async (req, res) => {
    try {
        const paymentId = String(req.params.paymentId || '').trim();
        if (!paymentId) {
            return res.status(400).json({ success: false, message: 'Payment ID is required' });
        }

        const donation = await Donation.findOne({ payment_id: paymentId }).lean();
        if (!donation) {
            return res.status(404).json({ success: false, message: 'Donation receipt not found' });
        }

        return res.json({
            success: true,
            data: {
                paymentId: donation.payment_id,
                orderId: donation.order_id,
                amount: donation.amount,
                donorName: donation.donor_name,
                email: donation.email,
                phone: donation.phone,
                address: donation.address,
                city: donation.city,
                state: donation.state,
                pincode: donation.pincode,
                pan: donation.pan,
                status: donation.status,
                date: donation.date
            }
        });
    } catch (error) {
        console.error('Get donation receipt error:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
