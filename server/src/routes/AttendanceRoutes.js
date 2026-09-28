const express = require('express');
const router = express.Router();
const Attendance = require('../models/AttendanceSchema');
const Employee = require('../models/AddNewEmployeeSchema');
const { Applicant, NormalApplicant } = require('../models/ApplicationSchema');
const { verifyAdminOrEmployee } = require('../middleware/auth');

// Utility helper to format Date to YYYY-MM-DD (Local ISO date string)
const getTodayString = (dateObj = new Date()) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// ============================================
// 1. PUNCH IN / MARK PRESENT
// ============================================
router.post('/punch-in', async (req, res) => {
    try {
        const { email, name, designation, district, state, workMode, notes } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Employee email is required." });
        }

        const todayStr = getTodayString();
        const now = new Date();

        let attendance = await Attendance.findOne({ employeeEmail: email, date: todayStr });

        if (attendance && attendance.punchIn && attendance.status !== 'Punched Out') {
            return res.json({ 
                success: true, 
                message: "Already punched in for today!", 
                data: attendance 
            });
        }

        if (!attendance) {
            // Find empId if available
            let empObj = await Employee.findOne({ email });
            const empId = empObj ? empObj.empId : '';

            attendance = new Attendance({
                empId: empId || '',
                employeeEmail: email,
                employeeName: name || (empObj ? empObj.fullName : email.split('@')[0]),
                designation: designation || (empObj ? empObj.designation : 'Employee'),
                district: district || (empObj ? empObj.district : ''),
                state: state || (empObj ? empObj.state : ''),
                date: todayStr,
                status: 'Punched In',
                punchIn: now,
                workMode: workMode || 'Office',
                notes: notes || '',
                isOnline: true,
                lastPingAt: now,
                history: [{
                    action: 'PUNCH_IN',
                    timestamp: now,
                    notes: notes || `Punched in via dashboard (${workMode || 'Office'})`
                }]
            });
        } else {
            attendance.status = 'Punched In';
            if (!attendance.punchIn) attendance.punchIn = now;
            if (workMode) attendance.workMode = workMode;
            if (notes) attendance.notes = notes;
            attendance.isOnline = true;
            attendance.lastPingAt = now;
            attendance.history.push({
                action: 'PUNCH_IN',
                timestamp: now,
                notes: notes || `Punched in via dashboard (${workMode || 'Office'})`
            });
        }

        await attendance.save();

        res.json({
            success: true,
            message: "Punch-In successful!",
            data: attendance
        });

    } catch (error) {
        console.error("Punch In Error:", error);
        res.status(500).json({ success: false, message: "Failed to punch in: " + error.message });
    }
});

// ============================================
// 2. PUNCH OUT / END DAY
// ============================================
router.post('/punch-out', async (req, res) => {
    try {
        const { email, notes } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Employee email is required." });
        }

        const todayStr = getTodayString();
        const now = new Date();

        let attendance = await Attendance.findOne({ employeeEmail: email, date: todayStr });

        if (!attendance) {
            return res.status(404).json({ success: false, message: "No active attendance record found for today to punch out." });
        }

        attendance.status = 'Punched Out';
        attendance.punchOut = now;
        attendance.isOnline = false;
        if (notes) attendance.notes = notes;
        attendance.history.push({
            action: 'PUNCH_OUT',
            timestamp: now,
            notes: notes || "Punched out via dashboard"
        });

        await attendance.save();

        res.json({
            success: true,
            message: "Punch-Out successful! Have a great evening.",
            data: attendance
        });

    } catch (error) {
        console.error("Punch Out Error:", error);
        res.status(500).json({ success: false, message: "Failed to punch out: " + error.message });
    }
});

// ============================================
// 3. HEARTBEAT ACTIVE TIME TRACKER PING
// ============================================
router.post('/heartbeat', async (req, res) => {
    try {
        const { email, name, designation, district, state, activeSeconds = 60 } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required." });
        }

        const todayStr = getTodayString();
        const now = new Date();

        // Sanitize activeSeconds (prevent abnormal single ping increments)
        const secondsToAdd = Math.min(Math.max(parseInt(activeSeconds, 10) || 60, 1), 300);

        let attendance = await Attendance.findOne({ employeeEmail: email, date: todayStr });

        if (!attendance) {
            let empObj = await Employee.findOne({ email });
            const empId = empObj ? empObj.empId : '';

            attendance = new Attendance({
                empId: empId || '',
                employeeEmail: email,
                employeeName: name || (empObj ? empObj.fullName : email.split('@')[0]),
                designation: designation || (empObj ? empObj.designation : 'Employee'),
                district: district || (empObj ? empObj.district : ''),
                state: state || (empObj ? empObj.state : ''),
                date: todayStr,
                status: 'Punched In',
                punchIn: now,
                totalActiveSeconds: secondsToAdd,
                lastPingAt: now,
                isOnline: true,
                history: [{
                    action: 'AUTO_START',
                    timestamp: now,
                    activeSeconds: secondsToAdd,
                    notes: "Auto-started session on active software activity"
                }]
            });
        } else {
            attendance.totalActiveSeconds = (attendance.totalActiveSeconds || 0) + secondsToAdd;
            attendance.lastPingAt = now;
            attendance.isOnline = true;
            if (!attendance.punchIn) attendance.punchIn = now;
        }

        await attendance.save();

        res.json({
            success: true,
            totalActiveSeconds: attendance.totalActiveSeconds,
            isOnline: attendance.isOnline,
            status: attendance.status
        });

    } catch (error) {
        console.error("Heartbeat Error:", error);
        res.status(500).json({ success: false, message: "Heartbeat failed" });
    }
});

// ============================================
// 4. GET EMPLOYEE'S OWN ATTENDANCE HISTORY
// ============================================
router.get('/my-attendance', verifyAdminOrEmployee, async (req, res) => {
    try {
        let email = '';
        if (req.user && req.user.role === 'admin' && req.query.email) {
            email = req.query.email.toString().trim();
        } else if (req.user && (req.user.email || req.user.emp_username)) {
            email = (req.user.email || req.user.emp_username).toString().trim();
        } else {
            email = (req.query.email || '').toString().trim();
        }

        if (!email) {
            return res.status(400).json({ success: false, message: "Authenticated user email is required." });
        }

        const todayStr = getTodayString();
        const todayRecord = await Attendance.findOne({ employeeEmail: email, date: todayStr }).lean();
        const historyRecords = await Attendance.find({ employeeEmail: email })
            .sort({ date: -1 })
            .limit(60)
            .lean();

        res.json({
            success: true,
            today: todayRecord || null,
            history: historyRecords
        });

    } catch (error) {
        console.error("My Attendance Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch attendance history." });
    }
});

// ============================================
// 5. ADMIN: GET TODAY'S / DATE REPORT FOR ALL EMPLOYEES
// ============================================
router.get('/admin/today-report', async (req, res) => {
    try {
        const targetDate = req.query.date || getTodayString();

        // 1. Fetch all registered employees across all 3 source schemas
        const directEmployees = await Employee.find().select('empId fullName email mobile designation district state').lean();
        const ngoApplicants = await Applicant.find({ emp_username: { $exists: true, $ne: '' } })
            .select('fullName email emp_username phone roleApplied applyForPost district state').lean();
        const normalApplicants = await NormalApplicant.find({ emp_username: { $exists: true, $ne: '' } })
            .select('fullName email emp_username phone roleApplied applyForPost district state').lean();

        // Combine and deduplicate by email
        const empMap = new Map();

        directEmployees.forEach(e => {
            if (e.email) {
                empMap.set(e.email.toLowerCase(), {
                    empId: e.empId || '',
                    fullName: e.fullName || 'Unknown',
                    email: e.email.toLowerCase(),
                    mobile: e.mobile || '',
                    designation: e.designation || 'Employee',
                    district: e.district || '',
                    state: e.state || '',
                    source: 'Employee'
                });
            }
        });

        const mergeApplicants = (list, sourceName) => {
            list.forEach(a => {
                const mail = (a.email || a.emp_username || '').toLowerCase();
                if (mail && !empMap.has(mail)) {
                    empMap.set(mail, {
                        empId: a.empId || 'EMP-' + mail.substring(0, 4).toUpperCase(),
                        fullName: a.fullName || mail.split('@')[0],
                        email: mail,
                        mobile: a.phone || '',
                        designation: a.roleApplied || a.applyForPost || 'Field Executive',
                        district: a.district || '',
                        state: a.state || '',
                        source: sourceName
                    });
                }
            });
        };

        mergeApplicants(ngoApplicants, 'NGO Applicant');
        mergeApplicants(normalApplicants, 'Normal Applicant');

        const allEmpList = Array.from(empMap.values());

        // 2. Fetch all Attendance records for targetDate
        const attendanceRecords = await Attendance.find({ date: targetDate }).lean();
        const attendanceMap = new Map();
        attendanceRecords.forEach(att => {
            attendanceMap.set(att.employeeEmail.toLowerCase(), att);
        });

        // 3. Merge attendance details with employee list
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
        let presentCount = 0;
        let absentCount = 0;
        let totalActiveSeconds = 0;

        const mergedReport = allEmpList.map(emp => {
            const att = attendanceMap.get(emp.email);

            if (att) {
                // Check online status based on last ping within 5 minutes
                const isRecentlyActive = att.lastPingAt && new Date(att.lastPingAt) >= fiveMinsAgo && att.status !== 'Punched Out';
                const status = att.status || (isRecentlyActive ? 'Punched In' : 'Present');

                if (status === 'Punched In' || status === 'Present' || status === 'Punched Out' || status === 'Half Day') {
                    presentCount++;
                } else {
                    absentCount++;
                }

                totalActiveSeconds += (att.totalActiveSeconds || 0);

                return {
                    ...emp,
                    attendanceId: att._id,
                    status: status,
                    punchIn: att.punchIn || null,
                    punchOut: att.punchOut || null,
                    totalActiveSeconds: att.totalActiveSeconds || 0,
                    lastPingAt: att.lastPingAt || null,
                    isOnline: Boolean(isRecentlyActive),
                    workMode: att.workMode || 'Office',
                    notes: att.notes || ''
                };
            } else {
                absentCount++;
                return {
                    ...emp,
                    attendanceId: null,
                    status: 'Absent',
                    punchIn: null,
                    punchOut: null,
                    totalActiveSeconds: 0,
                    lastPingAt: null,
                    isOnline: false,
                    workMode: 'Office',
                    notes: 'No attendance marked'
                };
            }
        });

        res.json({
            success: true,
            date: targetDate,
            stats: {
                totalEmployees: allEmpList.length,
                presentCount,
                absentCount,
                totalActiveSeconds
            },
            report: mergedReport
        });

    } catch (error) {
        console.error("Admin Today Report Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate attendance report: " + error.message });
    }
});

// ============================================
// 6. ADMIN: GET SPECIFIC EMPLOYEE ATTENDANCE DOSSIER / HISTORY
// ============================================
router.get('/admin/employee-history/:email', async (req, res) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({ success: false, message: "Employee email is required." });
        }

        const cleanEmail = email.toLowerCase();

        // 1. Fetch Employee Profile details
        let empProfile = await Employee.findOne({ email: cleanEmail }).lean();
        if (!empProfile) {
            empProfile = await Applicant.findOne({ $or: [{ email: cleanEmail }, { emp_username: cleanEmail }] }).lean();
        }
        if (!empProfile) {
            empProfile = await NormalApplicant.findOne({ $or: [{ email: cleanEmail }, { emp_username: cleanEmail }] }).lean();
        }

        // 2. Fetch all attendance records
        const records = await Attendance.find({ employeeEmail: cleanEmail })
            .sort({ date: -1 })
            .limit(100)
            .lean();

        // Calculate Stats
        let totalActiveSeconds = 0;
        let presentDays = 0;
        let absentDays = 0;

        records.forEach(r => {
            totalActiveSeconds += (r.totalActiveSeconds || 0);
            if (r.status === 'Present' || r.status === 'Punched In' || r.status === 'Punched Out' || r.status === 'Half Day') {
                presentDays++;
            } else if (r.status === 'Absent') {
                absentDays++;
            }
        });

        res.json({
            success: true,
            employee: empProfile || { email: cleanEmail, fullName: cleanEmail.split('@')[0] },
            stats: {
                totalDaysTracked: records.length,
                presentDays,
                absentDays,
                totalActiveSeconds,
                averageActiveSecondsPerDay: records.length > 0 ? Math.round(totalActiveSeconds / records.length) : 0
            },
            history: records
        });

    } catch (error) {
        console.error("Employee History Error:", error);
        res.status(500).json({ success: false, message: "Failed to load employee attendance history." });
    }
});

// ============================================
// 7. ADMIN: EXPORT ATTENDANCE REPORT CSV
// ============================================
router.get('/admin/export', async (req, res) => {
    try {
        const targetDate = req.query.date || getTodayString();
        const records = await Attendance.find({ date: targetDate }).lean();

        let csv = 'Employee ID,Name,Email,Designation,District,State,Date,Status,Work Mode,Punch In,Punch Out,Active Hours,Notes\n';

        records.forEach(r => {
            const activeHours = (r.totalActiveSeconds / 3600).toFixed(2);
            const punchInStr = r.punchIn ? new Date(r.punchIn).toLocaleTimeString() : 'N/A';
            const punchOutStr = r.punchOut ? new Date(r.punchOut).toLocaleTimeString() : 'N/A';
            const cleanNotes = (r.notes || '').replace(/"/g, '""');

            csv += `"${r.empId || ''}","${r.employeeName || ''}","${r.employeeEmail || ''}","${r.designation || ''}","${r.district || ''}","${r.state || ''}","${r.date}","${r.status}","${r.workMode}","${punchInStr}","${punchOutStr}","${activeHours}","${cleanNotes}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${targetDate}.csv`);
        res.status(200).send(csv);

    } catch (error) {
        console.error("Export Error:", error);
        res.status(500).json({ success: false, message: "CSV Export failed" });
    }
});

module.exports = router;
