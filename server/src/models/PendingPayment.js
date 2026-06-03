const mongoose = require('mongoose');

const PendingPaymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    paymentType: {
        type: String,
        required: true,
        enum: ['silayi', 'swarojgaar', 'healthcard', 'application', 'donation']
    },
    data: {
        type: mongoose.Schema.Types.Mixed,  // Flexible data storage
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600  // 60 minutes TTL - auto cleanup
    }
});

// Compound index for faster queries
PendingPaymentSchema.index({ orderId: 1, paymentType: 1 });

module.exports = mongoose.model('PendingPayment', PendingPaymentSchema);
