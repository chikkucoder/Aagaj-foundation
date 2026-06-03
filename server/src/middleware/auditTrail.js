const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AuditLog = require('../models/AuditLog');

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const redactKeys = new Set([
    'password',
    'hashPass',
    'token',
    'authorization',
    'TWILIO_AUTH_TOKEN',
    'JWT_SECRET'
]);

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const redactSensitiveData = (input) => {
    if (Array.isArray(input)) return input.map(redactSensitiveData);
    if (!isObject(input)) return input;

    const output = {};
    for (const [key, value] of Object.entries(input)) {
        if (redactKeys.has(key)) {
            output[key] = '[REDACTED]';
            continue;
        }

        if (typeof value === 'string' && value.length > 500) {
            output[key] = `${value.slice(0, 500)}...[TRUNCATED]`;
            continue;
        }

        output[key] = redactSensitiveData(value);
    }

    return output;
};

const parseActorFromToken = (req) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return { id: 'anonymous', role: 'guest', uniqueId: '' };
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return { id: 'anonymous', role: 'guest', uniqueId: '' };

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return {
            id: decoded.id ? String(decoded.id) : 'anonymous',
            role: decoded.role ? String(decoded.role) : 'user',
            uniqueId: decoded.uniqueId ? String(decoded.uniqueId) : ''
        };
    } catch (error) {
        return { id: 'anonymous', role: 'guest', uniqueId: '' };
    }
};

const createAuditTrailMiddleware = (options = {}) => {
    const excludePaths = options.excludePaths || [];

    return (req, res, next) => {
        if (!WRITE_METHODS.has(req.method)) return next();

        const path = req.path || '';
        if (excludePaths.some((prefix) => path.startsWith(prefix))) return next();

        const requestId = crypto.randomBytes(8).toString('hex');
        req.auditRequestId = requestId;

        const actor = parseActorFromToken(req);
        const bodySnapshot = redactSensitiveData(req.body || {});
        const querySnapshot = redactSensitiveData(req.query || {});

        res.on('finish', async () => {
            try {
                await AuditLog.create({
                    actor,
                    action: `${req.method} ${req.path}`,
                    method: req.method,
                    path: req.path,
                    statusCode: res.statusCode,
                    ipAddress: req.ip || req.connection?.remoteAddress || '',
                    userAgent: req.get('User-Agent') || '',
                    requestId,
                    metadata: {
                        body: bodySnapshot,
                        query: querySnapshot
                    }
                });
            } catch (error) {
                console.warn('Audit trail write failed:', error.message);
            }
        });

        next();
    };
};

module.exports = { createAuditTrailMiddleware };
