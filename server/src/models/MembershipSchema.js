const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema({
    membershipId: { type: String, required: true, unique: true }, // e.g. AF-MBR-2026-10001
    certificateNo: { type: String, required: true, unique: true }, // e.g. AF/MBR/2026/0101
    fullName: { type: String, required: true, trim: true },
    fatherOrHusbandName: { type: String, trim: true, default: '' },
    dobOrAge: { type: String, trim: true, default: '' },
    gender: { type: String, trim: true, default: 'Other' },
    photoUrl: { type: String, default: '' },
    
    mobileNumber: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    district: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    pincode: { type: String, trim: true, default: '' },
    
    aadhaarNumber: { type: String, trim: true, default: '' },
    panNumber: { type: String, uppercase: true, trim: true, default: '' },
    
    occupation: { type: String, trim: true, default: '' },
    organization: { type: String, trim: true, default: '' },
    
    membershipType: { 
        type: String, 
        enum: ['General Member', 'Volunteer', 'Life Member', 'Active Member'], 
        default: 'General Member' 
    },
    joiningDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    interestAreas: [{ type: String }],
    declarationAccepted: { type: Boolean, default: true },
    
    paymentAmount: { type: Number, required: true, min: 1 },
    paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Paid' },
    paymentId: { type: String, required: true },
    orderId: { type: String, required: true },
    paymentDate: { type: Date, default: Date.now },
    
    certificateIssued: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Membership', MembershipSchema);
