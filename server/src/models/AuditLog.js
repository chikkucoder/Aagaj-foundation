const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    actor: {
        id: { type: String, default: 'anonymous' },
        role: { type: String, default: 'guest' },
        uniqueId: { type: String, default: '' }
    },
    action: { type: String, required: true },
    method: { type: String, required: true },
    path: { type: String, required: true },
    statusCode: { type: Number, required: true },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    requestId: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now }
});

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ 'actor.id': 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
