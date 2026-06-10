const express = require('express');
const router = express.Router();
const Appointment = require('../models/AppointmentSchema');
const HealthPartner = require('../models/SwasthyaSurkshaSchema');
const HealthCard = require('../models/HealthCardSchema');
const multer = require('multer');
const { sendSMS, sendWhatsApp } = require('../services/twilioService');
const { validateRequest } = require('../middleware/requestValidation');
const { appointmentBookSchema, testNotifySchema } = require('../utils/routeSchemas');

const buildHealthIdCandidates = (rawHealthId) => {
    const input = String(rawHealthId || '').trim();
    const upper = input.toUpperCase();
    const candidates = new Set([input, upper]);

    if (/^\d{6}$/.test(input)) {
        candidates.add(`MC-${input}`);
    }

    const match = upper.match(/^MC-(\d{6})$/);
    if (match) {
        candidates.add(match[1]);
    }

    return Array.from(candidates).filter(Boolean);
};

// Verify that a Health ID exists before appointment booking
router.get('/verify-health/:healthId', async (req, res) => {
    try {
        const candidates = buildHealthIdCandidates(req.params.healthId);
        const card = await HealthCard.findOne({ healthId: { $in: candidates } })
            .select('healthId fullName mobile bloodGroup')
            .lean();

        if (!card) {
            return res.status(404).json({ success: false, message: 'Health ID not found. Please generate health card first.' });
        }

        return res.json({ success: true, data: card });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ मेमोरी स्टोरेज सेटअप (फाइल फोल्डर में नहीं जाएगी)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

// Route: Register & Upload to DB
router.post('/book', upload.single('healthCard'), validateRequest({ body: appointmentBookSchema }), async (req, res) => {
    try {
        const { 
            name, gender, age, aadhar, phone, bloodGroup, 
            healthId, street, city, pin, department, doctor, date, message, hospitalId,
            appointmentType
        } = req.body;

        if (!name || !aadhar || !phone || !healthId || !date || !hospitalId || !appointmentType) {
            return res.status(400).json({
                success: false,
                message: 'Required fields missing. Please select a hospital, fill all details, and select appointment type.'
            });
        }

        const validTypes = ['physical_visit', 'teleconsultation'];
        if (!validTypes.includes(appointmentType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid appointment type selected.'
            });
        }

        const healthIdCandidates = buildHealthIdCandidates(healthId);
        const verifiedCard = await HealthCard.findOne({ healthId: { $in: healthIdCandidates } })
            .select('healthId fullName mobile')
            .lean();

        if (!verifiedCard) {
            return res.status(400).json({
                success: false,
                message: 'Health ID not verified. Please verify valid Health ID before booking appointment.'
            });
        }

        const partner = await HealthPartner.findOne({ uniqueId: hospitalId }).lean();
        if (!partner) {
            return res.status(400).json({ success: false, message: 'Invalid medical facility selected. Please choose a valid facility.' });
        }

        const newAppointment = new Appointment({
            name, gender, age, aadhar, phone, bloodGroup,
            healthId: verifiedCard.healthId,
            street, city, pincode: pin,
            department,
            doctor: doctor || partner.businessName,
            hospitalId,
            hospitalName: partner.businessName,
            date,
            message,
            appointmentType
        });

        // ✅ फाइल को डेटाबेस बफर में डालना
        if (req.file) {
            newAppointment.healthCardData = req.file.buffer;
            newAppointment.healthCardContentType = req.file.mimetype;
            newAppointment.healthCardFileName = req.file.originalname;
        }

        await newAppointment.save();

        // 🟢 Send SMS & WhatsApp Notification
        let notificationResults = null;
        const typeLabel = appointmentType === 'teleconsultation' ? 'Teleconsultation' : 'Physical Visit';
        const appointmentMsg = `Hello ${name}, your appointment (${typeLabel}) with ${doctor || 'the doctor'} at ${department || 'the clinic'} on ${date} has been successfully requested. Thank you for choosing us!`;
        
        if (phone) {
            const [smsResult, waResult] = await Promise.all([
                sendSMS(phone, appointmentMsg),
                sendWhatsApp(phone, appointmentMsg)
            ]);
            notificationResults = {
                sms: smsResult,
                whatsapp: waResult
            };
            console.log('Appointment notification results:', {
                phone,
                sms: smsResult,
                whatsapp: waResult
            });
        }

        const responsePayload = {
            success: true,
            message: "Registered Successfully in Database!",
            data: {
                id: newAppointment._id,
                name: newAppointment.name,
                healthId: newAppointment.healthId,
                phone: newAppointment.phone,
                hospitalName: newAppointment.hospitalName,
                date: newAppointment.date,
                department: newAppointment.department,
                doctor: newAppointment.doctor,
                appointmentType: newAppointment.appointmentType,
                createdAt: newAppointment.createdAt
            }
        };
        if (process.env.NODE_ENV !== 'production') {
            responsePayload.notificationResults = notificationResults;
        }

        res.status(200).json(responsePayload);

    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ success: false, message: "Database Error: " + error.message });
    }
});

// Route: फाइल देखने के लिए (ID के ज़रिये डेटाबेस से फाइल निकालना)
router.get('/view-card/:id', async (req, res) => {
    try {
        const patient = await Appointment.findById(req.params.id);
        if (!patient || !patient.healthCardData) return res.status(404).send("No file found");

        res.set('Content-Type', patient.healthCardContentType);
        res.send(patient.healthCardData);
    } catch (e) { res.status(500).send(e.message); }
});

// ✅ Route: Get All Appointments (For Admin Dashboard)
router.get('/all', async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .select('-healthCardData')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: appointments });
    } catch (error) {
        console.error("Fetch Appointments Error:", error);
        res.status(500).json({ success: false, message: "Error fetching appointments" });
    }
});

// Debug route to validate SMS/WhatsApp delivery without booking flow
router.post('/test-notify', validateRequest({ body: testNotifySchema }), async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(404).json({ success: false, message: 'Not found' });
        }

        const { phone, message, sendSms = true, sendWhatsapp = true } = req.body;

        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone is required' });
        }

        const text = message || 'Aagaj test notification from appointment system.';
        const results = {};

        if (sendSms) {
            const smsRes = await sendSMS(phone, text);
            results.sms = smsRes;
        }

        if (sendWhatsapp) {
            const waRes = await sendWhatsApp(phone, text);
            results.whatsapp = waRes;
        }

        return res.json({ success: true, message: 'Notification attempt completed', results });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
