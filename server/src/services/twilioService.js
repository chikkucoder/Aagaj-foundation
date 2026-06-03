const twilio = require('twilio');

const isValidAccountSid = (sid) => /^AC[a-zA-Z0-9]{32}$/.test(String(sid || '').trim());
const isMessagingServiceSid = (sid) => /^MG[a-zA-Z0-9]{32}$/.test(String(sid || '').trim());

// Initialize Twilio using environment variables
// Safely initialize so the backend doesn't crash on start if dummy credentials are set
const getTwilioClient = () => {
    const accountSid = String(process.env.TWILIO_ACCOUNT_SID || '').trim();
    const authToken = String(process.env.TWILIO_AUTH_TOKEN || '').trim();

    if (!accountSid || !authToken) {
        console.warn('Twilio not configured: set TWILIO_ACCOUNT_SID (AC...) and TWILIO_AUTH_TOKEN.');
        return null;
    }

    if (!isValidAccountSid(accountSid)) {
        if (isMessagingServiceSid(accountSid)) {
            console.warn('TWILIO_ACCOUNT_SID currently has an MG value. MG is Messaging Service SID, not Account SID. Put AC... in TWILIO_ACCOUNT_SID.');
        } else {
            console.warn('Invalid TWILIO_ACCOUNT_SID format. It must start with AC.');
        }
        return null;
    }

    try {
        return twilio(accountSid, authToken);
    } catch (e) {
        console.error('Twilio client initialization failed:', e.message);
        return null;
    }
};

/**
 * Helper function to ensure phone numbers are in E.164 format (+91XXXXXXXXXX)
 * @param {string} phone 
 * @returns {string} 
 */
const formatPhoneNumber = (phone) => {
    // Remove all non-numeric characters except '+'
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // If it's a 10-digit number without a country code, prepend +91 by default
    if (cleaned.length === 10 && !cleaned.startsWith('+')) {
        return `+91${cleaned}`;
    }
    
    // If it doesn't have a plus sign but has more than 10 digits (e.g. 919876543210)
    if (!cleaned.startsWith('+')) {
        return `+${cleaned}`;
    }

    return cleaned;
};

/**
 * Send an SMS using Twilio
 * @param {string} to Phone number to send SMS to
 * @param {string} message Text message body
 */
const sendSMS = async (to, message) => {
    try {
        const client = getTwilioClient();
        if (!client) {
            console.warn('Skipping SMS because Twilio client is not available.');
            return { success: false, channel: 'sms', reason: 'twilio_client_unavailable' };
        }

        const messagingServiceSid = String(process.env.TWILIO_MESSAGING_SERVICE_SID || '').trim();
        const fromNumber = String(process.env.TWILIO_PHONE_NUMBER || '').trim();

        if (!fromNumber && !isMessagingServiceSid(messagingServiceSid)) {
            console.warn('Twilio SMS sender missing: set TWILIO_PHONE_NUMBER or TWILIO_MESSAGING_SERVICE_SID (MG...).');
            return { success: false, channel: 'sms', reason: 'sms_sender_missing' };
        }

        const formattedNumber = formatPhoneNumber(to);
        const payload = {
            body: message,
            to: formattedNumber
        };

        if (isMessagingServiceSid(messagingServiceSid)) {
            payload.messagingServiceSid = messagingServiceSid;
        } else {
            payload.from = fromNumber;
        }

        const response = await client.messages.create(payload);

        console.log(`SMS queued to ${formattedNumber}. SID: ${response.sid}`);
        return { success: true, channel: 'sms', sid: response.sid, to: formattedNumber };
    } catch (error) {
        console.error(`Twilio SMS Error (${to}):`, error.code || 'NO_CODE', error.message);
        return { success: false, channel: 'sms', reason: error.code || 'twilio_sms_error', message: error.message };
    }
};

/**
 * Send a WhatsApp message using Twilio
 * @param {string} to Phone number to send WhatsApp message to
 * @param {string} message Text message body
 */
const sendWhatsApp = async (to, message) => {
    try {
        const client = getTwilioClient();
        if (!client) {
            console.warn('Skipping WhatsApp because Twilio client is not available.');
            return { success: false, channel: 'whatsapp', reason: 'twilio_client_unavailable' };
        }

        let waFrom = String(process.env.TWILIO_WHATSAPP_NUMBER || '').trim();
        if (!waFrom) {
            console.warn('Twilio WhatsApp sender missing: set TWILIO_WHATSAPP_NUMBER (example: whatsapp:+14155238886).');
            return { success: false, channel: 'whatsapp', reason: 'whatsapp_sender_missing' };
        }
        if (!waFrom.startsWith('whatsapp:')) waFrom = `whatsapp:${waFrom}`;

        const formattedNumber = formatPhoneNumber(to);
        const response = await client.messages.create({
            body: message,
            from: waFrom,
            to: `whatsapp:${formattedNumber}`
        });

        console.log(`WhatsApp queued to ${formattedNumber}. SID: ${response.sid}`);
        return { success: true, channel: 'whatsapp', sid: response.sid, to: formattedNumber };
    } catch (error) {
        console.error(`Twilio WhatsApp Error (${to}):`, error.code || 'NO_CODE', error.message);
        return { success: false, channel: 'whatsapp', reason: error.code || 'twilio_whatsapp_error', message: error.message };
    }
};

module.exports = { sendSMS, sendWhatsApp, formatPhoneNumber };
