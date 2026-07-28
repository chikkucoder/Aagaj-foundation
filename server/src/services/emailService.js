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

const sendSilayiRegistrationConfirmation = async (beneficiary) => {
    if (!beneficiary || !beneficiary.email) return { success: false, message: 'Missing email' };

    const name = (beneficiary.name || 'Beneficiary').toString().trim();
    const serial = (beneficiary.serialNumber || '').toString().trim();
    const trainingName = (beneficiary.trainingName || 'Sewing Training').toString().trim();

    return sendMail({
        from: emailUser,
        to: beneficiary.email,
        subject: 'Aagaj Foundation - Silayi Yojana Registration Confirmed',
        html: `
            <h3>Hello ${name},</h3>
            <p>We are pleased to inform you that your registration for the <strong>Mahila Silayi Prasikshan Yojana</strong> has been confirmed successfully.</p>
            <p><strong>Registration Serial No:</strong> ${serial}</p>
            <p><strong>Training Selected:</strong> ${trainingName}</p>
            <p><strong>Status:</strong> Paid (Rs. ${beneficiary.registrationFee || 799})</p>
            <br>
            <p>Welcome to Aagaj Foundation. We wish you the best for your training!</p>
            <p>Thank you,<br>Aagaj Foundation</p>
        `
    });
};

const sendSwarojgaarRegistrationConfirmation = async (group, emailAddress) => {
    const toEmail = emailAddress || (group && group.email);
    if (!toEmail) return { success: false, message: 'Missing email' };

    const groupName = (group.groupName || 'Group').toString().trim();
    const membersCount = Array.isArray(group.members) ? group.members.length : 0;

    return sendMail({
        from: emailUser,
        to: toEmail,
        subject: 'Aagaj Foundation - Swarojgaar Group Registration Confirmed',
        html: `
            <h3>Hello,</h3>
            <p>Your group <strong>${groupName}</strong> has been registered successfully under the <strong>Mahila Swarojgaar Yojana</strong>.</p>
            <p><strong>Total Registered Members:</strong> ${membersCount}</p>
            <p><strong>Payment Status:</strong> Paid (Rs. ${group.registrationFee || 100})</p>
            <br>
            <p>Thank you for choosing Aagaj Foundation.</p>
            <p>Thank you,<br>Aagaj Foundation</p>
        `
    });
};

const sendHealthCardConfirmation = async (card) => {
    if (!card || !card.email) return { success: false, message: 'Missing email' };

    const name = (card.fullName || 'Beneficiary').toString().trim();
    const healthId = (card.healthId || '').toString().trim();
    const cardType = (card.cardType || 'Single').toString().trim();
    const expiry = card.expiryDate ? new Date(card.expiryDate).toLocaleDateString('en-IN') : 'N/A';

    return sendMail({
        from: emailUser,
        to: card.email,
        subject: 'Aagaj Foundation - Swasthya Suraksha Health Card Created',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background-color: #ED1C24; padding: 20px; text-align: center; color: white;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">AAGAJ FOUNDATION</h2>
                    <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold;">Swasthya Suraksha Health Card</p>
                </div>
                <div style="padding: 24px; background-color: #ffffff; color: #334155;">
                    <h3 style="margin-top: 0; color: #0f172a; font-size: 18px;">Dear ${name},</h3>
                    <p style="line-height: 1.6; font-size: 14px;">Your Swasthya Suraksha Health Card has been generated successfully. Here are your card details:</p>
                    
                    <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px; padding: 16px; margin: 20px 0;">
                        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 6px 0; font-weight: bold; color: #64748b; width: 40%;">Health ID:</td>
                                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${healthId}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Card Type:</td>
                                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${cardType} Card</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Expiry Date:</td>
                                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${expiry}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Blood Group:</td>
                                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${card.bloodGroup || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Mobile:</td>
                                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${card.mobile || 'N/A'}</td>
                            </tr>
                        </table>
                    </div>

                    ${card.familyMembers && card.familyMembers.length > 0 ? `
                        <h4 style="margin: 20px 0 10px 0; color: #0f172a; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Registered Family Members:</h4>
                        <table style="width: 100%; font-size: 12px; border-collapse: collapse; text-align: left; margin-bottom: 20px;">
                            <thead>
                                <tr style="background-color: #f1f5f9; color: #475569;">
                                    <th style="padding: 8px; font-weight: bold;">Name</th>
                                    <th style="padding: 8px; font-weight: bold;">Relation</th>
                                    <th style="padding: 8px; font-weight: bold;">Age</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${card.familyMembers.map(m => `
                                    <tr style="border-bottom: 1px solid #f1f5f9;">
                                        <td style="padding: 8px; color: #334155;">${m.fullName}</td>
                                        <td style="padding: 8px; color: #334155;">${m.relationship}</td>
                                        <td style="padding: 8px; color: #334155;">${m.age}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : ''}
                    
                    <p style="line-height: 1.6; font-size: 13px; color: #64748b; margin-top: 24px;">Please present this Health ID or download your card from our website to avail of medical benefits and discounts at our partner hospitals.</p>
                </div>
                <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0;">© 2026 Aagaj Foundation. All Rights Reserved.</p>
                </div>
            </div>
        `
    });
};

const maskEmail = (email) => {
    if (!email || typeof email !== 'string') return 'e****l@domain.com';
    const parts = email.trim().split('@');
    if (parts.length !== 2) return email;
    const local = parts[0];
    const domain = parts[1];
    let maskedLocal = '';
    if (local.length <= 2) {
        maskedLocal = local[0] + '*';
    } else {
        maskedLocal = local[0] + '*'.repeat(local.length - 2) + local[local.length - 1];
    }
    return `${maskedLocal}@${domain}`;
};

const sendHealthCardOtpEmail = async (toEmail, otp, healthId, userName = 'Valued Member') => {
    if (!toEmail) return { success: false, message: 'Missing email' };

    const masked = maskEmail(toEmail);
    console.log(`[EMAIL OTP DISPATCH] To: ${masked} | Health ID: ${healthId} | OTP: ${otp}`);

    if (!isConfigured() || !transporter) {
        console.log(`\n==================================================`);
        console.log(`[DEV MODE EMAIL OTP]: ${otp}`);
        console.log(`[Target Email]: ${toEmail} (Masked: ${masked})`);
        console.log(`[Health ID]: ${healthId}`);
        console.log(`==================================================\n`);
        return { success: true, provider: 'dev_mode', message: 'Logged to console (Dev Mode - Email credentials not set)' };
    }

    return sendMail({
        from: emailUser,
        to: toEmail,
        subject: `Swasthya Suraksha - Health Card Access OTP: ${otp}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);">
                <div style="background-color: #ED1C24; padding: 24px; text-align: center; color: white;">
                    <h2 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">AAGAJ FOUNDATION</h2>
                    <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: 600; opacity: 0.9;">Swasthya Suraksha Digital Identity</p>
                </div>
                <div style="padding: 30px; background-color: #ffffff; color: #1e293b;">
                    <h3 style="margin-top: 0; color: #0f172a; font-size: 18px; font-weight: 700;">Hello ${userName},</h3>
                    <p style="line-height: 1.6; font-size: 14px; color: #475569;">
                        We received a request to view/download your Swasthya Suraksha Health Card for Health ID: <strong style="color: #0f172a;">${healthId}</strong>.
                    </p>
                    
                    <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                        <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">Your 6-Digit OTP Verification Code</span>
                        <span style="font-size: 32px; font-weight: 900; color: #ED1C24; font-family: monospace; letter-spacing: 6px;">${otp}</span>
                    </div>

                    <p style="line-height: 1.5; font-size: 12px; color: #64748b; margin: 0;">
                        ⏱️ This OTP is valid for <strong>5 minutes</strong>. Maximum 5 verification attempts allowed.
                    </p>
                    <p style="line-height: 1.5; font-size: 12px; color: #94a3b8; margin-top: 8px;">
                        If you did not request this OTP, please ignore this email.
                    </p>
                </div>
                <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
                    <p style="margin: 0;">© 2026 Aagaj Foundation. All Rights Reserved.</p>
                </div>
            </div>
        `
    });
};

module.exports = {
    sendMail,
    sendApplicationConfirmation,
    sendSwasthyaPartnerConfirmation,
    sendSilayiRegistrationConfirmation,
    sendSwarojgaarRegistrationConfirmation,
    sendHealthCardConfirmation,
    sendHealthCardOtpEmail,
    maskEmail
};
