const mongoose = require('mongoose');

const PaymentLogSchema = new mongoose.Schema({
    orderId: { 
        type: String, 
        required: true, 
        index: true,
        unique: true  // Prevent duplicate processing
    },
    
    amount: { 
        type: String, 
        required: true 
    },
    
    status: { 
        type: String, 
        required: true,
        enum: ['success', 'failed', 'pending', 'cancelled']
    },
    
    paymentId: { 
        type: String,
        sparse: true  // Allow multiple null values (for failed payments)
    },
    
    transactionId: String,
    
    schemeType: {
        type: String,
        enum: ['silayi', 'swarojgaar', 'health', 'application', 'donation'],
        required: true
    },
    
    ipAddress: String,
    userAgent: String,
    
    rawResponse: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    
    verificationStatus: { 
        type: String, 
        enum: ['pending', 'verified', 'failed', 'signature_mismatch', 'amount_mismatch'], 
        default: 'pending',
        index: true
    },
    
    failureReason: String,
    
    signatureVerified: {
        type: Boolean,
        default: false
    },
    
    amountVerified: {
        type: Boolean,
        default: false
    },
    
    beneficiaryEmail: String,
    beneficiaryPhone: String,
    beneficiaryName: String,
    
    timestamp: { 
        type: Date, 
        default: Date.now,
        index: true,
        expires: 7776000  // Auto-delete after 90 days
    },
    
    verifiedAt: Date
});

// Index for queries
PaymentLogSchema.index({ orderId: 1, timestamp: -1 });
PaymentLogSchema.index({ status: 1, timestamp: -1 });
PaymentLogSchema.index({ schemeType: 1, timestamp: -1 });

module.exports = mongoose.model('PaymentLog', PaymentLogSchema);
