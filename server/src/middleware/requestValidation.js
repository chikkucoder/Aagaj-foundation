const Joi = require('joi');

const sanitizeValidationError = (error) => {
    if (!error || !error.details) return ['Invalid request'];
    return error.details.map((detail) => detail.message);
};

const validateSection = (sectionName, schema, req) => {
    if (!schema) return null;

    const source = req[sectionName] || {};
    const { error, value } = schema.validate(source, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
    });

    if (error) {
        return { sectionName, errors: sanitizeValidationError(error) };
    }

    req[sectionName] = value;
    return null;
};

const validateRequest = ({ body, query, params } = {}) => {
    return (req, res, next) => {
        const bodyError = validateSection('body', body, req);
        if (bodyError) {
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                section: bodyError.sectionName,
                errors: bodyError.errors
            });
        }

        const queryError = validateSection('query', query, req);
        if (queryError) {
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                section: queryError.sectionName,
                errors: queryError.errors
            });
        }

        const paramsError = validateSection('params', params, req);
        if (paramsError) {
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                section: paramsError.sectionName,
                errors: paramsError.errors
            });
        }

        return next();
    };
};

module.exports = { validateRequest, Joi };
