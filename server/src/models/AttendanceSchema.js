const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    empId: { type: String, default: '' },
    employeeEmail: { type: String, required: true, index: true },
    employeeName: { type: String, required: true },
    designation: { type: String, default: 'Employee' },
    district: { type: String, default: '' },
    state: { type: String, default: '' },
    date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
    status: { 
        type: String, 
        enum: ['Present', 'Absent', 'Half Day', 'Punched In', 'Punched Out', 'On Leave'],
        default: 'Present' 
    },
    punchIn: { type: Date, default: null },
    punchOut: { type: Date, default: null },
    totalActiveSeconds: { type: Number, default: 0 },
    lastPingAt: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: true },
    workMode: { 
        type: String, 
        enum: ['Office', 'Work From Home', 'Field Work'],
        default: 'Office' 
    },
    notes: { type: String, default: '' },
    history: [{
        action: { type: String, required: true }, // e.g. "PUNCH_IN", "PUNCH_OUT", "HEARTBEAT", "STATUS_CHANGE"
        timestamp: { type: Date, default: Date.now },
        activeSeconds: { type: Number, default: 0 },
        notes: { type: String, default: '' }
    }]
}, { 
    timestamps: true,
    collection: 'attendances' 
});

// Composite index to ensure quick single lookup per employee per date
attendanceSchema.index({ employeeEmail: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
