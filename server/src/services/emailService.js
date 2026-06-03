const nodemailer = require('nodemailer');

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

const isConfigured = () => Boolean(emailUser && emailPass);

const transporter = isConfigured()
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: { user: emailUser, pass: emailPass }
    })
    : null;

const sendMail = async (options) => {
    if (!isConfigured() || !transporter) {
        return { success: false, message: 'Email credentials not configured' };
    }

    try {
        await transporter.sendMail(options);
        return { success: true };
    } catch (error) {
        console.error('Email send failed:', error.message);
        return { success: false, message: error.message };
    }
};

const sendApplicationConfirmation = async (appData) => {
    if (!appData || !appData.email) return { success: false, message: 'Missing email' };

    const safeName = (appData.fullName || 'Applicant').toString().trim();
    const role = (appData.roleApplied || appData.applyForPost || '').toString().trim();
    const uniqueId = (appData.uniqueId || '').toString().trim();

    return sendMail({
        from: emailUser,
        to: appData.email,
        subject: 'Aagaj Foundation - Application Submitted',
        html: `
            <h3>Hello ${safeName},</h3>
            <p>Your application has been submitted successfully.</p>
            <p><strong>Application ID:</strong> ${uniqueId || 'Pending'}</p>
            ${role ? `<p><strong>Role:</strong> ${role}</p>` : ''}
            <p>Our team will review your application and contact you soon.</p>
            <p>Thank you,<br>Aagaj Foundation</p>
        `
    });
};

const sendSwasthyaPartnerConfirmation = async (partner) => {
    if (!partner || !partner.email) return { success: false, message: 'Missing email' };

    const businessName = (partner.businessName || 'Partner').toString().trim();
    const uniqueId = (partner.uniqueId || '').toString().trim();

    return sendMail({
        from: emailUser,
        to: partner.email,
        subject: 'Aagaj Foundation - Swasthya Suraksha Partner Registration',
        html: `
            <h3>Hello ${businessName},</h3>
            <p>Your Swasthya Suraksha partner registration has been submitted successfully.</p>
            <p><strong>Partner ID:</strong> ${uniqueId || 'Pending'}</p>
            <p>Our team will verify your details and reach out if needed.</p>
            <p>Thank you,<br>Aagaj Foundation</p>
        `
    });
};

module.exports = {
    sendMail,
    sendApplicationConfirmation,
    sendSwasthyaPartnerConfirmation
};
