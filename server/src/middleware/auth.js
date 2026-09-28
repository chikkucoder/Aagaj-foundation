const jwt = require('jsonwebtoken');

const getJwtSecret = () => process.env.JWT_SECRET || 'aagaz_healthcard_secret_key';

/**
 * Centralized Authentication Middleware
 * Validates JWT token from Authorization header (Bearer <token>)
 * Attaches decoded payload to req.user
 */
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ success: false, message: "Access Denied. No Token Provided." });
        }

        const token = authHeader.startsWith("Bearer ") 
            ? authHeader.substring(7).trim() 
            : authHeader.trim();

        if (!token || token === 'employee-session' || token === 'null' || token === 'undefined') {
            return res.status(401).json({ success: false, message: "Access Denied. Invalid or hardcoded token rejected." });
        }

        const decoded = jwt.verify(token, getJwtSecret());
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Session expired. Please log in again." });
        }
        return res.status(401).json({ success: false, message: "Invalid or corrupted token." });
    }
};

/**
 * Role-Based Authorization Middleware Generator
 * Usage: authorizeRoles('admin'), authorizeRoles('admin', 'employee')
 */
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ success: false, message: "Access Denied. User role missing." });
        }

        const userRole = String(req.user.role).toLowerCase();
        const normalizedAllowedRoles = allowedRoles.map(r => String(r).toLowerCase());

        if (!normalizedAllowedRoles.includes(userRole)) {
            return res.status(403).json({ success: false, message: "Access Denied. Unauthorized Role." });
        }

        next();
    };
};

/**
 * Pre-configured Middleware Helpers
 */
const verifyAdmin = [verifyToken, authorizeRoles('admin')];
const verifyAdminOrEmployee = [verifyToken, authorizeRoles('admin', 'employee')];
const verifyHospital = [verifyToken, authorizeRoles('hospital', 'admin')];

module.exports = {
    verifyToken,
    authorizeRoles,
    verifyAdmin,
    verifyAdminOrEmployee,
    verifyHospital,
    getJwtSecret
};
