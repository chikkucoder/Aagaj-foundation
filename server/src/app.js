const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ SECURITY IMPORTS
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { validate } = require('./utils/validators'); // Moved to utils/
const PaymentLog = require('./models/PaymentLog');
const { createAuditTrailMiddleware } = require('./middleware/auditTrail');


const PORT = process.env.PORT || 5000;

const app = express();
app.disable('x-powered-by');
app.set('etag', false);

// Required for AWS/proxy deployments so rate limiting uses real client IP from X-Forwarded-For.
const trustProxySetting = process.env.TRUST_PROXY;
if (trustProxySetting === 'true') {
    app.set('trust proxy', true);
} else if (trustProxySetting && !Number.isNaN(Number(trustProxySetting))) {
    app.set('trust proxy', Number(trustProxySetting));
} else {
    app.set('trust proxy', 1);
}


// ============================================
// ✅ RATE LIMITING CONFIGURATION
// ============================================
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/health', // Don't rate limit health check
    validate: { trustProxy: false }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Only 5 failed login attempts
    skipSuccessfulRequests: true, // Don't count successful logins
    message: {
        success: false,
        message: 'Too many failed login attempts. Account locked for 15 minutes.'
    },
    validate: { trustProxy: false }
});

const paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 payment attempts per hour per IP
    message: {
        success: false,
        message: 'Payment limit exceeded. Please try again later.'
    },
    validate: { trustProxy: false }
});

// --- Middleware ---
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

app.use(createAuditTrailMiddleware({
    excludePaths: ['/health', '/appointment/test-notify']
}));

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    next();
});

// ✅ SECURITY MIDDLEWARE (MUST BE FIRST)
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ✅ CORS CONFIGURATION
const allowedOrigins = [
    "http://localhost:5000",
    "http://localhost:5173", // Vite default port
    "http://localhost:3000"
];

if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
    if (process.env.FRONTEND_URL.startsWith('https://') && !process.env.FRONTEND_URL.includes('localhost')) {
        const domain = process.env.FRONTEND_URL.replace('https://', '');
        allowedOrigins.push(`https://www.${domain}`);
    }
}
if (process.env.API_URL) {
    allowedOrigins.push(process.env.API_URL);
}

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        const isVercelDomain = /\.vercel\.app$/.test(origin); // Allow any Vercel preview/production domains
        
        if (isLocalhost || isVercelDomain || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn("❌ CORS BLOCKED:", origin);
            callback(new Error("CORS policy: Access denied"));
        }
    },
    credentials: true
}));

// ✅ Safe OPTIONS handler
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
// ✅ APPLY RATE LIMITING
app.use('/api/', apiLimiter);
app.use('/schemes/create-order', paymentLimiter);
app.use('/swarojgaar/create-order', paymentLimiter);
app.use('/api/healthcard/create-order', paymentLimiter);
app.use('/application/create-order', paymentLimiter);
app.use('/donation/create-donation-order', paymentLimiter);

const backendUploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(backendUploadsDir, {
    setHeaders: (res) => {
        res.set('Access-Control-Allow-Origin', '*');
    }
}));

// Fallback proxy for uploads: if a file doesn't exist locally, fetch it from production
app.use('/uploads', async (req, res, next) => {
    if (req.method !== 'GET') {
        return next();
    }
    const filePath = req.path; // relative to '/uploads', e.g. "/healthcards/health-123.jpg" or "/photo-123.jpg"
    const fallbackBaseUrl = process.env.PRODUCTION_FALLBACK_URL || 'https://aagajfoundation.com';
    const prodUrl = `${fallbackBaseUrl.replace(/\/+$/, '')}/uploads${filePath}`;
    try {
        const response = await fetch(prodUrl);
        if (response.ok) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return res.send(buffer);
        }
    } catch (err) {
        console.error("Failed to proxy upload from production:", err);
    }
    res.status(404).send('Not Found');
});


const redactedMongoUri = (process.env.MONGO_URI || '').replace(/:([^@]+)@/, ':****@');
console.log(`[MongoDB] Attempting to connect to: ${redactedMongoUri}`);

mongoose.connect(process.env.MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
})
    .then(async () => {
        console.log("✅ MongoDB Connected");

        // ✅ Seed Test Hospital if it doesn't exist
        try {
            const HealthPartner = require('./models/SwasthyaSurkshaSchema');
            const bcrypt = require('bcryptjs');
            const testEmail = process.env.TEST_HOSPITAL_EMAIL;
            if (testEmail) {
                const existingHosp = await HealthPartner.findOne({ email: testEmail });
                if (!existingHosp) {
                    const hashedPassword = await bcrypt.hash(process.env.TEST_HOSPITAL_PASS || 'Aagaj@123', 10);
                    const newHosp = new HealthPartner({
                        uniqueId: "HOSP-TEST-01",
                        category: "Hospital",
                        businessName: "Test Foundation Hospital",
                        email: testEmail,
                        password: hashedPassword,
                        licenseNumber: "TEST-LIC-001",
                        address: {
                            fullAddress: "Main Street, Patna",
                            city: "Patna",
                            state: "Bihar",
                            pincode: "800001"
                        },
                        contact: {
                            ownerName: "Vivek Kumar",
                            whatsappNumber: "9431430464"
                        },
                        isActive: true
                    });
                    await newHosp.save();
                    console.log("🏥 Test Hospital Seeded: " + testEmail);
                }
            }
        } catch (err) { console.error("Seeding Error:", err); }

        // ✅ Seed default carousel images if collection is empty
        try {
            const CarouselImage = require('./models/CarouselImageSchema');
            const defaultImagesCount = await CarouselImage.countDocuments();
            if (defaultImagesCount === 0) {
                const defaultCarouselImages = [
                    { imageUrl: '/pic1.jpeg', publicId: 'seed_pic1', title: 'Aagaj Foundation Rally', order: 1 },
                    { imageUrl: '/pic4.jpg', publicId: 'seed_pic4', title: 'Women Health Distribution', order: 2 },
                    { imageUrl: '/pic2.jpg', publicId: 'seed_pic2', title: 'Sewing Training Center', order: 3 },
                    { imageUrl: '/pic5.jpg', publicId: 'seed_pic5', title: 'Awareness Campaign', order: 4 },
                    { imageUrl: '/pic3.jpg', publicId: 'seed_pic3', title: 'Community Meeting', order: 5 }
                ];
                await CarouselImage.insertMany(defaultCarouselImages);
                console.log("🏞️ Default carousel images seeded successfully.");
            }
        } catch (seedErr) {
            console.error("Carousel Seeding Error:", seedErr);
        }
    })
    .catch(err => console.log("❌ DB Error:", err));


// --- Import Schema & Models ---
const { Applicant, NormalApplicant } = require('./models/ApplicationSchema');
const Employee = require('./models/AddNewEmployeeSchema'); // ✅ Import New Employee Schema
const Beneficiary = require('./models/SilayiPrasikshanSchema'); // ✅ Import Correct Scheme Schema
const SwarojgaarGroup = require('./models/SwarojgaarRegisterSchema'); // ✅ Import Swarojgaar Schema
const HealthPartner = require('./models/SwasthyaSurkshaSchema'); // ✅ Import Swasthya Surksha Schema
const HealthCard = require('./models/HealthCardSchema');

// --- Multer Setup ---
// On Vercel, filesystem is read-only so we wrap in try/catch
try {
    if (!fs.existsSync(backendUploadsDir)) {
        fs.mkdirSync(backendUploadsDir, { recursive: true });
    }
} catch (err) {
    console.warn('⚠️ Could not create uploads dir (expected on Vercel):', err.message);
}

// ============================================
//      ✅ JWT AUTHENTICATION MIDDLEWARE
// ============================================
const verifyAdmin = (req, res, next) => {
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
        next();
    } catch (err) {
        res.status(400).json({ success: false, message: "Invalid Token" });
    }
};

// ============================================
//               API ROUTES
// ============================================

// 3. Get All Applicants
app.get('/api/admin/get-all-applicants', verifyAdmin, async (req, res) => {
    try {
        const ngoApplicants = await Applicant.find().sort({ date: -1 }).lean();
        const normalApplicants = await NormalApplicant.find().sort({ date: -1 }).lean();
        const employees = await Employee.find().sort({ createdAt: -1 }).lean();

        const ngoTagged = ngoApplicants.map(a => ({ ...a, job_category: 'NGO' }));
        const normalTagged = normalApplicants.map(a => ({ ...a, job_category: 'Normal' }));

        const employeeTagged = employees.map(e => ({
            _id: e._id,
            uniqueId: e.empId.replace(/^EMP/, ''),
            fullName: e.fullName,
            email: e.email,
            mobile: e.mobile,
            roleApplied: e.designation,
            district: e.district,
            state: e.state,
            job_category: 'Employee',
            emp_username: e.email,
            emp_password: 'Protected',
            photoPath: '',
            applicationPdf: ''
        }));

        res.json([...ngoTagged, ...normalTagged, ...employeeTagged]);
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ message: "Error fetching data" });
    }
});

// ✅ 3.05 Get All Unified Transactions (PaymentLog)
app.get('/api/admin/transactions', verifyAdmin, async (req, res) => {
    try {
        const PaymentLog = require('./models/PaymentLog');
        const logs = await PaymentLog.find().sort({ timestamp: -1 }).lean();
        res.json({ success: true, data: logs });
    } catch (error) {
        console.error("Transactions Fetch Error:", error);
        res.status(500).json({ success: false, message: "Error fetching transaction logs" });
    }
});

// ✅ 3.1 Get All Scheme Beneficiaries (Silai, Swarojgaar, Swasthya)
app.get('/api/admin/get-all-beneficiaries', verifyAdmin, async (req, res) => {
    try {
        const silai = await Beneficiary.find().sort({ createdAt: -1 }).lean();
        const silaiTagged = silai.map(s => ({
            ...s,
            yojanaName: 'Mahila Silai Prasikshan Yojana'
        }));

        const swarojgaar = await SwarojgaarGroup.find().sort({ createdAt: -1 }).lean();
        const swarojgaarTagged = swarojgaar.map(s => ({
            ...s,
            yojanaName: 'Mahila Swarojgaar Yojana',
            name: s.groupName || "Unknown Group",
            guardianName: "Group Entry",
            address: `${s.village || ''}, ${s.panchayat || ''}, ${s.district || ''}`,
            mobileNumber: (Array.isArray(s.members) && s.members[0] && s.members[0].mobileNumber)
                ? s.members[0].mobileNumber
                : "N/A",
            aadharNumber: "N/A"
        }));

        const health = await HealthPartner.find().sort({ createdAt: -1 }).lean();
        const healthTagged = health.map(s => ({
            ...s,
            yojanaName: 'Swasthya Suraksha Yojana',
            type: s.category,
            biz: s.businessName,
            name: s.businessName,
            owner: s.contact ? s.contact.ownerName : "N/A",
            guardianName: s.contact ? s.contact.ownerName : "N/A",
            phone: s.contact ? s.contact.whatsappNumber : "N/A",
            mobileNumber: s.contact ? s.contact.whatsappNumber : "N/A",
            addr: s.address ? s.address.fullAddress : "",
            address: s.address ? `${s.address.fullAddress}, ${s.address.city}` : "",
            city: s.address ? s.address.city : (s.city || ""),
            state: s.address ? s.address.state : (s.state || ""),
            pin: s.address ? s.address.pincode : (s.pin || ""),
            license: s.licenseNumber,
            aadharNumber: s.licenseNumber,
            extraInfo: s.numberOfBeds || s.nablStatus || s.drugLicenseExpiry || "-",
            services: s.services || [],
            createdAt: s.registrationDate || new Date()
        }));

        const allBeneficiaries = [...silaiTagged, ...swarojgaarTagged, ...healthTagged];
        res.json(allBeneficiaries);
    } catch (error) {
        console.error("Fetch Beneficiaries Error:", error);
        res.status(500).json({ message: "Error fetching scheme data" });
    }
});

// ✅ 3.2 Get Employee Performance Stats (Aggregation)
app.get('/api/admin/employee-detailed-stats', verifyAdmin, async (req, res) => {
    try {
        const [silayiRows, swarojgaarRows, healthRows] = await Promise.all([
            Beneficiary.find({}).select('serialNumber name registeredBy').lean(),
            SwarojgaarGroup.find({}).select('groupName members registeredBy').lean(),
            HealthPartner.find({}).select('uniqueId businessName registeredBy').lean()
        ]);

        const finalStats = {};

        const getEmployeeKey = (registeredBy) => {
            const value = (registeredBy || '').toString().trim();
            return value || 'Admin/Self';
        };

        const ensureEmployee = (email) => {
            if (!finalStats[email]) {
                finalStats[email] = {
                    email,
                    silayi: { count: 0, details: [] },
                    swarojgaar: { count: 0, details: [] },
                    health: { count: 0, details: [] },
                    total: 0
                };
            }
            return finalStats[email];
        };

        silayiRows.forEach((row) => {
            const email = getEmployeeKey(row.registeredBy);
            const employee = ensureEmployee(email);
            employee.silayi.count += 1;
            employee.silayi.details.push({
                serialNumber: row.serialNumber || 'N/A',
                name: row.name || 'N/A'
            });
        });

        swarojgaarRows.forEach((row) => {
            const email = getEmployeeKey(row.registeredBy);
            const employee = ensureEmployee(email);
            employee.swarojgaar.count += 1;
            employee.swarojgaar.details.push({
                groupName: row.groupName || 'N/A',
                memberCount: Array.isArray(row.members) ? row.members.length : 0
            });
        });

        healthRows.forEach((row) => {
            const email = getEmployeeKey(row.registeredBy);
            const employee = ensureEmployee(email);
            employee.health.count += 1;
            employee.health.details.push({
                uniqueId: row.uniqueId || 'N/A',
                businessName: row.businessName || 'N/A'
            });
        });

        Object.values(finalStats).forEach((employee) => {
            employee.total = employee.silayi.count + employee.swarojgaar.count + employee.health.count;
        });

        const report = Object.values(finalStats).sort((a, b) => b.total - a.total);
        res.json(report);
    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ message: "Error generating report" });
    }
});

// ✅ Employee Profile + Health Card Stats
app.get('/api/employee/profile', async (req, res) => {
    try {
        const rawEmail = (req.query.email || '').toString().trim();
        if (!rawEmail) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const safeEmail = rawEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const emailRegex = new RegExp(`^${safeEmail}$`, 'i');

        let profileSource = 'employee';
        let user = await Employee.findOne({ email: emailRegex }).lean();

        if (!user) {
            profileSource = 'ngo';
            user = await Applicant.findOne({
                $or: [{ email: emailRegex }, { emp_username: emailRegex }]
            }).lean();
        }

        if (!user) {
            profileSource = 'normal';
            user = await NormalApplicant.findOne({
                $or: [{ email: emailRegex }, { emp_username: emailRegex }]
            }).lean();
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const identifiers = [
            user.email,
            user.emp_username,
            user.fullName,
            rawEmail
        ].map((value) => (value || '').toString().trim()).filter((value) => value !== '');

        const uniqueIdentifiers = Array.from(new Set(identifiers));

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

        const healthCardFilter = (isDistrictCoordinator && districtRegex)
            ? { 'address.district': districtRegex }
            : registeredByFilter;

        const swarojgaarFilter = (isDistrictCoordinator && districtRegex)
            ? { 'location.district': districtRegex }
            : registeredByFilter;

        const ngoApplicationFilter = (isDistrictCoordinator && districtRegex)
            ? { job_category: 'NGO', district: districtRegex }
            : { job_category: 'NGO', ...registeredByFilter };

        const [healthCardCount, silayiCount, swarojgaarCount, swasthyaCount, ngoApplicationCount] = await Promise.all([
            HealthCard.countDocuments(healthCardFilter),
            Beneficiary.countDocuments(registeredByFilter),
            SwarojgaarGroup.countDocuments(swarojgaarFilter),
            HealthPartner.countDocuments(registeredByFilter),
            Applicant.countDocuments(ngoApplicationFilter)
        ]);

        const profile = {
            fullName: user.fullName || 'N/A',
            email: user.email || user.emp_username || rawEmail,
            mobile: user.mobile || 'N/A',
            role,
            district: user.district || 'N/A',
            state: user.state || 'N/A',
            blockOrPlace: user.block || user.place || user.district || 'N/A',
            panchayat: user.panchayat || 'N/A',
            photoPath: user.photoPath || user.photoUrl || '',
            source: profileSource
        };

        return res.json({
            success: true,
            profile,
            stats: {
                healthCardCount,
                silayiCount,
                swarojgaarCount,
                swasthyaCount,
                ngoApplicationCount
            }
        });
    } catch (error) {
        console.error('Employee Profile Error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 4. Delete Employee
app.delete('/api/admin/delete-employee/:id', verifyAdmin, async (req, res) => {
    try {
        let user = await Applicant.findById(req.params.id);
        let Model = Applicant;

        if (!user) {
            user = await NormalApplicant.findById(req.params.id);
            Model = NormalApplicant;
        }

        if (!user) {
            user = await Employee.findById(req.params.id);
            Model = Employee;
        }

        if (!user) return res.json({ success: false, message: "Not found" });

        if (user.photoPath) {
            const p = path.join(__dirname, '..', user.photoPath.startsWith('/') ? user.photoPath.substring(1) : user.photoPath);
            if (fs.existsSync(p)) fs.unlinkSync(p);
        }
        if (user.applicationPdf) {
            const p = path.join(__dirname, '..', user.applicationPdf.startsWith('/') ? user.applicationPdf.substring(1) : user.applicationPdf);
            if (fs.existsSync(p)) fs.unlinkSync(p);
        }

        await Model.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
});


app.get('/api/healthcard/all', async (req, res) => {
    try {
        const HealthCard = require('./models/HealthCardSchema');
        const cards = await HealthCard.find().sort({ createdAt: -1 });
        res.json({ success: true, data: cards });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// ✅ Connect Routes (Prefixed with /api)
app.use('/api/admin', verifyAdmin, require('./routes/AddNewEmployeeRoutes'));
app.use('/api/schemes', require('./routes/SilayiPrasikshanRoutes'));
app.use('/api/swarojgaar', require('./routes/SwarojgaarRegisterRoutes'));
app.use('/api/swasthya', require('./routes/SwasthyaSurkshaRoutes'));
app.use('/api/appointment', require('./routes/AppointmentRoutes'));
app.use('/api/application', require('./routes/ApplicationRoutes'));

app.get('/api/donation/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'Backend is running perfectly'
    });
});

app.post('/api/donation/test-payment', (req, res) => {
    const testData = {
        success: true,
        status: 'test_mode',
        paymentUrl: process.env.GETEPAY_URL || "https://pay1.getepay.in:8443/getepayPortal/pg/generateInvoice",
        mid: process.env.GETEPAY_MID || "108",
        encryptedData: "TEST_ENCRYPTED_DATA_" + Date.now(),
        message: "This is test data - check your .env file for GETEPAY_URL"
    };
    res.json(testData);
});

const donationRoutes = require('./routes/DonationRoutes');
app.use('/api/donation', donationRoutes);

app.use('/api/admin-register', require('./routes/AdminRegisterRoutes'));

const HospitalAdminRoutes = require('./routes/HospitalAdminRoutes');
app.use('/api/hospital-admin-system', HospitalAdminRoutes);

const healthCardRoutes = require('./routes/HealthCardRoutes');
app.use('/api/healthcard', healthCardRoutes);

// ✅ Cloudinary Image Upload Route
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);

// ✅ Carousel Image Manager Route
const carouselRoutes = require('./routes/carouselRoutes');
app.use('/api/carousel', carouselRoutes);


// 6. Login
app.post('/api/employee/login', authLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        let user = await Applicant.findOne({ $or: [{ email: username }, { emp_username: username }] });

        if (!user) {
            user = await NormalApplicant.findOne({ $or: [{ email: username }, { emp_username: username }] });
        }

        if (!user) {
            user = await Employee.findOne({ email: username });
        }

        if (!user || (!user.emp_password && !user.password)) {
            return res.json({ success: false, message: "Invalid Credentials" });
        }

        const passwordToCompare = user.emp_password || user.password;
        const isMatch = await bcrypt.compare(password, passwordToCompare);

        if (isMatch) res.json({ success: true, user: user });
        else res.json({ success: false, message: "Invalid Credentials" });

    } catch (error) { console.error("Login Error:", error); res.status(500).json({ success: false, message: "Server error during login." }); }
});

// ✅ 404 for unknown APIs
app.use((req, res, next) => {
    return res.status(404).json({ success: false, message: 'API Route not found' });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
    console.error("🔥 Unhandled Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Only start HTTP server when running locally (not on Vercel serverless)
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

// Export for Vercel serverless
module.exports = app;
