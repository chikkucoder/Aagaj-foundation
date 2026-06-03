const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
    uniqueId: { type: String, unique: true }, 
    orderId: { type: String }, // ✅ Added for Getepay tracking
    status: { type: String, default: 'Pending' }, // ✅ Added for Getepay
    fullName: String,
    email: String,
    mobile: String,
    dob: String,
    district: String,
    state: String,
    block: String,
    panchayat: String,
    place: String,
    applyForPost: String,
    aadhar: String,
    photoPath: String,
    applicationPdf: String,
    roleApplied: String,
    job_category: String, 
    qualifications: { type: mongoose.Schema.Types.Mixed },
    paymentId: String,
    amount: Number,
    date: { type: Date, default: Date.now },
    registeredBy: { type: String, default: 'Self' },
    emp_username: { type: String, default: null },
    emp_password: { type: String, default: null }
});

const Applicant = mongoose.model('Applicant', applicantSchema);
const NormalApplicant = mongoose.model('NormalApplicant', applicantSchema);

module.exports = { Applicant, NormalApplicant };