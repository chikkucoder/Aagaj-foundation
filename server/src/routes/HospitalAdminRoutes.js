const express = require('express');
const router = express.Router();
const HealthPartner = require('../models/SwasthyaSurkshaSchema');
const PatientBill = require('../models/PatientBillSchema');
const Appointment = require('../models/AppointmentSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const HealthCard = require('../models/HealthCardSchema');
const rateLimit = require('express-rate-limit');
const AuditLog = require('../models/AuditLog');
const Employee = require('../models/AddNewEmployeeSchema');
const { Applicant, NormalApplicant } = require('../models/ApplicationSchema');
const Beneficiary = require('../models/SilayiPrasikshanSchema');
const SwarojgaarGroup = require('../models/SwarojgaarRegisterSchema');
const { validateRequest } = require('../middleware/requestValidation');
const {
    hospitalLoginSchema,
    generateCredentialsSchema,
    resetHospitalPasswordSchema,
    registerHospitalSchema,
    editHospitalSchema,
    hospitalIdQuerySchema,
    addBillSchema
} = require('../utils/routeSchemas');

// ============================================
// ✅ MIDDLEWARE: VERIFY SUPER ADMIN
// ============================================
const verifyAdmin = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ success: false, message: "Access Denied" });
    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) { res.status(400).json({ success: false, message: "Invalid Token" }); }
};

const hospitalAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    skipSuccessfulRequests: true,
    message: { success: false, message: 'Too many failed login attempts. Try again after 15 minutes.' }
});

const verifyHospital = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ success: false, message: 'Access Denied' });

    try {
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        if (verified.role !== 'hospital' || !verified.uniqueId) {
            return res.status(403).json({ success: false, message: 'Invalid hospital token' });
        }
        req.hospitalUser = verified;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid Token' });
    }
};

const enforceHospitalScope = (req, res, next) => {
    const requestedHospitalId = String(
        req.query.hospitalId || req.body.hospitalId || req.params.hospitalId || ''
    ).trim();

    if (!requestedHospitalId) {
        return res.status(400).json({ success: false, message: 'hospitalId is required' });
    }

    if (requestedHospitalId !== req.hospitalUser.uniqueId) {
        return res.status(403).json({ success: false, message: 'Forbidden: hospital scope mismatch' });
    }

    next();
};

// ============================================
// ✅ SUPER ADMIN ROUTES
// ============================================

// 1. Get Summary Stats for Super Admin
router.get('/admin/stats', verifyAdmin, async (req, res) => {
    try {
        const totalHospitals = await HealthPartner.countDocuments({ category: 'Hospital' });
        const activeHospitals = await HealthPartner.countDocuments({ category: 'Hospital', isActive: true });
        const totalBills = await PatientBill.aggregate([{ $group: { _id: null, total: { $sum: "$billAmount" } } }]);
        const totalTreatments = await PatientBill.countDocuments();
        const totalAppointments = await Appointment.countDocuments();

        res.json({
            success: true,
            stats: {
                totalHospitals,
                activeHospitals,
                totalBilling: totalBills[0] ? totalBills[0].total : 0,
                totalTreatments,
                totalAppointments
            }
        });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 2. Get All Hospitals with their stats
router.get('/admin/hospitals', verifyAdmin, async (req, res) => {
    try {
        const hospitals = await HealthPartner.find({ category: 'Hospital' }).lean();

        // Fetch billing and appointment stats for each hospital
        const hospitalData = await Promise.all(hospitals.map(async (h) => {
            const billStats = await PatientBill.aggregate([
                { $match: { hospitalId: h.uniqueId } },
                { $group: { _id: null, count: { $sum: 1 }, total: { $sum: "$billAmount" } } }
            ]);
            const apptCount = await Appointment.countDocuments({ hospitalId: h.uniqueId });

            return {
                ...h,
                treatmentCount: billStats[0] ? billStats[0].count : 0,
                totalBilling: billStats[0] ? billStats[0].total : 0,
                appointmentCount: apptCount,
                hasCredentials: !!h.password
            };
        }));

        const sanitizedHospitalData = hospitalData.map((h) => {
            const { password, ...safeHospital } = h;
            return {
                ...safeHospital,
                hasCredentials: Boolean(h.hasCredentials)
            };
        });

        res.json({ success: true, data: sanitizedHospitalData });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 4. Global Reports: List ALL patient treatments and bills across ALL hospitals
router.get('/admin/global-reports', verifyAdmin, async (req, res) => {
    try {
        const { fromDate, toDate, hospitalId } = req.query;
        const filter = {};

        if (hospitalId) {
            filter.hospitalId = String(hospitalId).trim();
        }

        if (fromDate || toDate) {
            filter.date = {};
            if (fromDate) {
                const from = new Date(fromDate);
                if (!isNaN(from.getTime())) filter.date.$gte = from;
            }
            if (toDate) {
                const to = new Date(toDate);
                if (!isNaN(to.getTime())) {
                    to.setHours(23, 59, 59, 999);
                    filter.date.$lte = to;
                }
            }
            if (Object.keys(filter.date).length === 0) {
                delete filter.date;
            }
        }

        const bills = await PatientBill.find(filter).sort({ date: -1 }).lean();

        // Link hospital names to bills for better reporting
        const detailedReports = await Promise.all(bills.map(async (b) => {
            const hospital = await HealthPartner.findOne({ uniqueId: b.hospitalId }).select('businessName');
            return {
                ...b,
                hospitalName: hospital ? hospital.businessName : 'Unknown Hospital'
            };
        }));

        res.json({ success: true, data: detailedReports });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 4.1 Audit Logs for sensitive write actions
router.get('/admin/audit-logs', verifyAdmin, async (req, res) => {
    try {
        const { limit = 100, role, action, fromDate, toDate } = req.query;
        const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500);

        const filter = {};
        if (role) filter['actor.role'] = String(role).trim();
        if (action) filter.action = { $regex: String(action).trim(), $options: 'i' };

        if (fromDate || toDate) {
            filter.createdAt = {};
            if (fromDate) {
                const from = new Date(fromDate);
                if (!isNaN(from.getTime())) filter.createdAt.$gte = from;
            }
            if (toDate) {
                const to = new Date(toDate);
                if (!isNaN(to.getTime())) {
                    to.setHours(23, 59, 59, 999);
                    filter.createdAt.$lte = to;
                }
            }
            if (Object.keys(filter.createdAt).length === 0) delete filter.createdAt;
        }

        const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(parsedLimit).lean();
        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 5. Generate/Update Credentials for a Hospital
router.post('/admin/generate-credentials', verifyAdmin, validateRequest({ body: generateCredentialsSchema }), async (req, res) => {
    try {
        const { uniqueId, email, password, loginId } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: "Email and Password are required" });

        const cleanedEmail = String(email).trim().toLowerCase();
        const resolvedLoginId = String(loginId || uniqueId || '').trim().toUpperCase();
        if (!resolvedLoginId) {
            return res.status(400).json({ success: false, message: "Login ID is required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const updated = await HealthPartner.findOneAndUpdate(
            { uniqueId },
            { email: cleanedEmail, loginId: resolvedLoginId, password: hashedPassword },
            { new: true }
        );

        if (!updated) return res.status(404).json({ success: false, message: "Hospital not found" });
        res.json({ success: true, message: "Credentials generated successfully" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 5.5. Admin Reset Hospital Password (Admin Control)
router.post('/admin/reset-hospital-password', verifyAdmin, validateRequest({ body: resetHospitalPasswordSchema }), async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Access Denied. Only Admin can reset hospital password." });
        }

        const { uniqueId, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const updated = await HealthPartner.findOneAndUpdate(
            { uniqueId },
            { password: hashedPassword },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Hospital not found" });
        }

        res.json({ success: true, message: "Hospital password reset successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 6. Admin Register New Hospital (Full Control)
router.post('/admin/register-hospital', verifyAdmin, validateRequest({ body: registerHospitalSchema }), async (req, res) => {
    try {
        const { biz, hashPass, license, city, state, pin, owner, phone, email, specialization } = req.body;

        // --- 🩺 Robust Validation ---
        if (!biz || !license || !owner || !phone || !city || !state || !pin || !email || !hashPass) {
            return res.status(400).json({ success: false, message: "All fields are required!" });
        }

        // Name validation (No numbers)
        if (!/^[a-zA-Z\s]+$/.test(owner)) {
            return res.status(400).json({ success: false, message: "Owner name should only contain letters!" });
        }

        // City/State validation (No numbers)
        if (!/^[a-zA-Z\s]+$/.test(city) || !/^[a-zA-Z\s]+$/.test(state)) {
            return res.status(400).json({ success: false, message: "City and State should only contain letters!" });
        }

        // WhatsApp number validation (10 digits)
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ success: false, message: "WhatsApp number must be exactly 10 digits!" });
        }

        // Pincode validation (6 digits)
        if (!/^\d{6}$/.test(pin)) {
            return res.status(400).json({ success: false, message: "Pincode must be exactly 6 digits!" });
        }

        // Email validation
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format!" });
        }

        // Check for duplicate license
        const existingLicense = await HealthPartner.findOne({ licenseNumber: license });
        if (existingLicense) return res.status(400).json({ success: false, message: "Hospital with this license already exists!" });

        const cleanedEmail = String(email).trim().toLowerCase();

        // Check for duplicate email
        const existingEmail = await HealthPartner.findOne({ email: cleanedEmail });
        if (existingEmail) return res.status(400).json({ success: false, message: "This email is already in use by another hospital!" });

        // 1. Generate Unique ID (Format: 100026 -> Counter + YearSuffix)
        const date = new Date();
        const yearSuffix = date.getFullYear().toString().slice(-2);

        const lastPartner = await HealthPartner.findOne({
            uniqueId: { $regex: `${yearSuffix}$` }
        }).sort({ _id: -1 });

        let counter = 1000;
        if (lastPartner && lastPartner.uniqueId) {
            const lastCounterStr = lastPartner.uniqueId.slice(0, -2);
            const lastCounter = parseInt(lastCounterStr);
            if (!isNaN(lastCounter)) counter = lastCounter + 1;
        }
        const newUniqueId = `${counter}${yearSuffix}`;
        const defaultLoginId = `HOSP-${newUniqueId}`;

        const existingLoginId = await HealthPartner.findOne({ loginId: defaultLoginId });
        if (existingLoginId) {
            return res.status(400).json({ success: false, message: "Auto-generated hospital login ID already exists. Please retry." });
        }

        // 2. Hash Password
        const hashedPassword = await bcrypt.hash(hashPass, 10);

        // 3. Create New Record
        const newHospital = new HealthPartner({
            uniqueId: newUniqueId,
            category: 'Hospital',
            businessName: biz,
            licenseNumber: license,
            specialization: specialization ? (Array.isArray(specialization) ? specialization : [specialization]) : ['General Medicine'],
            address: { city, state, pincode: pin, fullAddress: `${city}, ${state}` },
            contact: { ownerName: owner, whatsappNumber: phone },
            email: cleanedEmail,
            loginId: defaultLoginId,
            password: hashedPassword,
            isActive: true,
            registeredBy: 'Master Admin'
        });

        await newHospital.save();
        const safeHospital = newHospital.toObject();
        delete safeHospital.password;
        res.status(201).json({ success: true, message: "Hospital Registered Successfully!", data: safeHospital });

    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 7. Toggle Hospital Active Status
router.patch('/admin/toggle-status/:uniqueId', verifyAdmin, async (req, res) => {
    try {
        const hospital = await HealthPartner.findOne({ uniqueId: req.params.uniqueId });
        if (!hospital) return res.status(404).json({ success: false, message: "Hospital not found" });

        hospital.isActive = !hospital.isActive;
        await hospital.save();
        res.json({ success: true, message: `Hospital is now ${hospital.isActive ? 'Active' : 'Disabled'}`, isActive: hospital.isActive });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 8. Admin Edit Hospital
router.put('/admin/edit-hospital/:uniqueId', verifyAdmin, validateRequest({ body: editHospitalSchema }), async (req, res) => {
    try {
        const { biz, license, city, state, pin, owner, phone, email, specialization } = req.body;

        // Basic validation
        if (!biz || !license || !owner || !phone || !city || !state || !pin || !email) {
            return res.status(400).json({ success: false, message: "All fields are required!" });
        }

        // Check for duplicate license
        const existingLicense = await HealthPartner.findOne({ licenseNumber: license, uniqueId: { $ne: req.params.uniqueId } });
        if (existingLicense) return res.status(400).json({ success: false, message: "Hospital with this license already exists!" });

        // Check for duplicate email
        const existingEmail = await HealthPartner.findOne({ email: email.toLowerCase(), uniqueId: { $ne: req.params.uniqueId } });
        if (existingEmail) return res.status(400).json({ success: false, message: "This email is already in use by another hospital!" });

        let updateFields = {
            businessName: biz,
            licenseNumber: license,
            'address.city': city,
            'address.state': state,
            'address.pincode': pin,
            'address.fullAddress': `${city}, ${state}`,
            'contact.ownerName': owner,
            'contact.whatsappNumber': phone,
            email: email.toLowerCase()
        };

        if (specialization) {
            updateFields.specialization = Array.isArray(specialization) ? specialization : [specialization];
        } else {
            updateFields.specialization = [];
        }

        const updated = await HealthPartner.findOneAndUpdate(
            { uniqueId: req.params.uniqueId },
            { $set: updateFields },
            { new: true }
        );

        if (!updated) return res.status(404).json({ success: false, message: "Hospital not found" });
        const safeHospital = updated.toObject();
        delete safeHospital.password;
        res.json({ success: true, message: "Hospital updated successfully!", data: safeHospital });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 9. Admin Delete Hospital (with related records)
router.delete('/admin/delete-hospital/:uniqueId', verifyAdmin, async (req, res) => {
    try {
        const uniqueId = String(req.params.uniqueId || '').trim();
        if (!uniqueId) {
            return res.status(400).json({ success: false, message: 'Hospital ID is required' });
        }

        const hospital = await HealthPartner.findOne({ uniqueId, category: 'Hospital' });
        if (!hospital) {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }

        const [billsDeleted, appointmentsDeleted] = await Promise.all([
            PatientBill.deleteMany({ hospitalId: uniqueId }),
            Appointment.deleteMany({ hospitalId: uniqueId })
        ]);

        await HealthPartner.deleteOne({ uniqueId, category: 'Hospital' });

        return res.json({
            success: true,
            message: 'Hospital deleted successfully',
            deleted: {
                hospitalId: uniqueId,
                bills: billsDeleted.deletedCount || 0,
                appointments: appointmentsDeleted.deletedCount || 0
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// ✅ HOSPITAL PARTNER ROUTES
// ============================================

// 1. Hospital Login
router.post('/hospital/login', hospitalAuthLimiter, validateRequest({ body: hospitalLoginSchema }), async (req, res) => {
    try {
        const { email, password, identifier } = req.body;
        const loginInput = String(identifier || email || '').trim();

        if (!loginInput || !password) {
            return res.status(400).json({ success: false, message: "Login ID/Email and password are required" });
        }

        const hospital = await HealthPartner.findOne({
            category: 'Hospital',
            $or: [
                { email: loginInput.toLowerCase() },
                { loginId: loginInput.toUpperCase() },
                { uniqueId: loginInput }
            ]
        });

        if (!hospital || !hospital.password || hospital.isActive === false) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }

        const isMatch = await bcrypt.compare(password, hospital.password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid Credentials" });

        const token = jwt.sign({ id: hospital._id, uniqueId: hospital.uniqueId, role: 'hospital' }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            success: true,
            token,
            hospital: {
                name: hospital.businessName,
                uniqueId: hospital.uniqueId,
                loginId: hospital.loginId || hospital.uniqueId,
                email: hospital.email
            }
        });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 2. Fetch Bills for a Hospital
router.get('/hospital/bills', verifyHospital, validateRequest({ query: hospitalIdQuerySchema }), enforceHospitalScope, async (req, res) => {
    try {
        const { hospitalId } = req.query;
        const bills = await PatientBill.find({ hospitalId }).sort({ date: -1 });
        res.json({ success: true, data: bills });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 3. Add/Update Patient Bill
router.post('/hospital/add-bill', verifyHospital, validateRequest({ body: addBillSchema }), enforceHospitalScope, async (req, res) => {
    try {
        const { hospitalId, healthId, patientName, patientMobile, treatmentDetails, billAmount, status, billPhoto } = req.body;

        if (!patientName || !patientMobile || !treatmentDetails || !billAmount) {
            return res.status(400).json({ success: false, message: 'Missing required billing fields' });
        }

        const billId = 'BILL-' + Date.now();
        const newBill = new PatientBill({
            billId, hospitalId, healthId, patientName, patientMobile, treatmentDetails, billAmount, status, billPhoto
        });

        await newBill.save();
        res.json({ success: true, message: "Bill added successfully", data: newBill });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 4. Verify Patient (Fetch Name & Mobile from Health Card ID)
router.get('/hospital/verify-patient/:healthId', verifyHospital, async (req, res) => {
    try {
        const patient = await HealthCard.findOne({ healthId: req.params.healthId });
        if (!patient) return res.status(404).json({ success: false, message: "Patient not found. Re-check Health ID." });

        res.json({
            success: true,
            data: {
                name: patient.fullName,
                mobile: patient.mobile
            }
        });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 4. Fetch Appointments for a Hospital
router.get('/hospital/appointments', verifyHospital, validateRequest({ query: hospitalIdQuerySchema }), enforceHospitalScope, async (req, res) => {
    try {
        const { hospitalId } = req.query;
        const appointments = await Appointment.find({ hospitalId }).sort({ date: -1 });
        res.json({ success: true, data: appointments });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 5. Update Appointment Status (Approve/Reject)
router.patch('/hospital/update-appointment-status', verifyHospital, async (req, res) => {
    try {
        const { appointmentId, status, hospitalId } = req.body;
        if (!appointmentId || !status || !hospitalId) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Enforce scope
        if (hospitalId !== req.hospitalUser.uniqueId) {
            return res.status(403).json({ success: false, message: "Forbidden: hospital scope mismatch" });
        }

        // Validate status
        const validStatuses = ['Approved', 'Rejected', 'Pending'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        const appointment = await Appointment.findOneAndUpdate(
            { _id: appointmentId, hospitalId },
            { status },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        res.json({ success: true, message: `Appointment status updated to ${status} successfully`, data: appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 6. Admin Get Hospital Activity (Admin Control)
router.get('/admin/hospital-activity/:hospitalId', verifyAdmin, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Access Denied. Only Admin can access hospital activity." });
        }

        const { hospitalId } = req.params;

        const hospital = await HealthPartner.findOne({ uniqueId: hospitalId, category: 'Hospital' }).select('-password').lean();
        if (!hospital) {
            return res.status(404).json({ success: false, message: "Hospital not found" });
        }

        // Fetch bills
        const bills = await PatientBill.find({ hospitalId }).sort({ date: -1 }).lean();

        // Fetch appointments
        const appointments = await Appointment.find({ hospitalId }).sort({ date: -1 }).lean();

        // Fetch audit logs of the hospital actor
        const logs = await AuditLog.find({ 'actor.uniqueId': hospitalId }).sort({ createdAt: -1 }).limit(100).lean();

        // Calculate stats
        const totalBills = bills.length;
        const totalBilling = bills.reduce((sum, b) => sum + (b.billAmount || 0), 0);
        const totalAppointments = appointments.length;

        res.json({
            success: true,
            data: {
                hospital,
                stats: {
                    totalBills,
                    totalBilling,
                    totalAppointments
                },
                bills,
                appointments,
                logs
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 7. Admin Get Employee Activity Report (Admin Control)
router.get('/admin/employee-activity', verifyAdmin, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Access Denied. Only Admin can access employee activity." });
        }

        const rawEmail = (req.query.email || '').toString().trim();
        if (!rawEmail) {
            return res.status(400).json({ success: false, message: "Email parameter is required" });
        }

        // Try to find the user in Employee, Applicant, or NormalApplicant collections
        const safeEmail = rawEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const emailRegex = new RegExp(`^${safeEmail}$`, 'i');

        let user = await Employee.findOne({ email: emailRegex }).lean();
        let userSource = 'employees';

        if (!user) {
            user = await Applicant.findOne({
                $or: [{ email: emailRegex }, { emp_username: emailRegex }]
            }).lean();
            userSource = 'applicants';
        }

        if (!user) {
            user = await NormalApplicant.findOne({
                $or: [{ email: emailRegex }, { emp_username: emailRegex }]
            }).lean();
            userSource = 'normalApplicants';
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "Employee/Candidate record not found" });
        }

        // Resolve all identifier values to match in registeredBy field
        const identifiers = [
            user.email,
            user.emp_username,
            user.fullName,
            user.empId,
            rawEmail
        ].map((v) => (v || '').toString().trim()).filter((v) => v !== '');

        const uniqueIdentifiers = Array.from(new Set(identifiers));

        // Build registeredBy filter matching any identifier
        const buildRegisteredByFilter = (values) => {
            if (!values.length) return { registeredBy: 'Self' };
            const regexFilters = values.map((val) => {
                const safeVal = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                return { registeredBy: new RegExp(`^${safeVal}$`, 'i') };
            });
            return { $or: regexFilters };
        };

        const registeredByFilter = buildRegisteredByFilter(uniqueIdentifiers);
        const role = user.designation || user.roleApplied || user.applyForPost || 'Employee';
        const isDistrictCoordinator = role.toString().toLowerCase() === 'district coordinator';
        const districtValue = (user.district || '').toString().trim();
        const districtRegex = districtValue
            ? new RegExp(`^${districtValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
            : null;

        // Apply filters depending on District Coordinator role or registeredBy
        const healthCardFilter = (isDistrictCoordinator && districtRegex)
            ? { 'address.district': districtRegex }
            : registeredByFilter;

        const swarojgaarFilter = (isDistrictCoordinator && districtRegex)
            ? { 'location.district': districtRegex }
            : registeredByFilter;

        const ngoApplicationFilter = (isDistrictCoordinator && districtRegex)
            ? { job_category: 'NGO', district: districtRegex }
            : { job_category: 'NGO', ...registeredByFilter };

        // Fetch documents
        const [healthCards, silayiBeneficiaries, swarojgaarGroups, swasthyaPartners, ngoApplications] = await Promise.all([
            HealthCard.find(healthCardFilter).sort({ createdAt: -1 }).limit(100).lean(),
            Beneficiary.find(registeredByFilter).sort({ createdAt: -1 }).limit(100).lean(),
            SwarojgaarGroup.find(swarojgaarFilter).sort({ createdAt: -1 }).limit(100).lean(),
            HealthPartner.find(registeredByFilter).sort({ createdAt: -1 }).limit(100).lean(),
            Applicant.find(ngoApplicationFilter).sort({ date: -1 }).limit(100).lean()
        ]);

        // Security Audit Logs
        const logs = await AuditLog.find({
            $or: [
                { 'actor.id': String(user._id) },
                { 'actor.uniqueId': user.empId || user.uniqueId || '' },
                { 'actor.uniqueId': rawEmail }
            ]
        }).sort({ createdAt: -1 }).limit(100).lean();

        res.json({
            success: true,
            data: {
                profile: {
                    fullName: user.fullName || 'N/A',
                    email: user.email || user.emp_username || rawEmail,
                    mobile: user.mobile || 'N/A',
                    role,
                    district: user.district || 'N/A',
                    state: user.state || 'N/A',
                    blockOrPlace: user.block || user.place || user.district || 'N/A',
                    panchayat: user.panchayat || 'N/A',
                    empId: user.empId || user.uniqueId || 'N/A',
                    source: userSource
                },
                stats: {
                    healthCardsCount: healthCards.length,
                    silayiCount: silayiBeneficiaries.length,
                    swarojgaarCount: swarojgaarGroups.length,
                    swasthyaCount: swasthyaPartners.length,
                    ngoCount: ngoApplications.length
                },
                activities: {
                    healthCards,
                    silayiBeneficiaries,
                    swarojgaarGroups,
                    swasthyaPartners,
                    ngoApplications,
                    logs
                }
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
