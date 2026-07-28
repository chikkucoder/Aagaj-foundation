const axios = require('axios');
const { sendSMS: twilioSendSMS } = require('./twilioService');

/**
 * Format mobile number to 10 digits or E.164
 */
const formatIndianMobile = (mobile) => {
    let cleaned = String(mobile || '').replace(/\D/g, '');
    if (cleaned.startsWith('91') && cleaned.length === 12) {
        cleaned = cleaned.substring(2);
    }
    return cleaned;
};

/**
 * Mask mobile number for privacy (e.g., XXXXXX1234)
 */
const maskMobileNumber = (mobile) => {
    const cleaned = formatIndianMobile(mobile);
    if (cleaned.length >= 10) {
        return 'XXXXXX' + cleaned.slice(-4);
    }
    if (cleaned.length >= 4) {
        return 'X'.repeat(cleaned.length - 4) + cleaned.slice(-4);
    }
    return 'XXXXXX' + cleaned;
};

/**
 * Send OTP SMS using configured provider (Fast2SMS / MSG91 / Twilio)
 * Fallback to dev console logging if no API keys are configured.
 */
const sendOtpSMS = async (toMobile, otp, healthId) => {
    const cleanMobile = formatIndianMobile(toMobile);
    const provider = String(process.env.SMS_PROVIDER || '').toLowerCase().trim();
    const message = `Your Swasthya Suraksha Health Card verification OTP is ${otp}. Valid for 5 minutes. Do not share it with anyone.`;

    console.log(`[SMS ATTEMPT] Provider: ${provider || 'dev_mode'} | Target: +91${maskMobileNumber(cleanMobile)}`);

    try {
        // 1. FAST2SMS (India)
        if (provider === 'fast2sms' || process.env.FAST2SMS_API_KEY) {
            const apiKey = process.env.FAST2SMS_API_KEY;
            if (!apiKey || apiKey === 'YOUR_FAST2SMS_API_KEY_HERE') {
                console.warn('[Fast2SMS] Missing API Key. Set FAST2SMS_API_KEY in .env');
            } else {
                const response = await axios.post(
                    'https://www.fast2sms.com/dev/bulkV2',
                    {
                        variables_values: otp,
                        route: 'otp',
                        numbers: cleanMobile
                    },
                    {
                        headers: {
                            authorization: apiKey,
                            'Content-Type': 'application/json'
                        },
                        timeout: 10000
                    }
                );
                console.log('[Fast2SMS Success]:', response.data);
                return { success: true, provider: 'fast2sms', data: response.data };
            }
        }

        // 2. MSG91 (India)
        if (provider === 'msg91' || process.env.MSG91_AUTH_KEY) {
            const authKey = process.env.MSG91_AUTH_KEY;
            const templateId = process.env.MSG91_TEMPLATE_ID;
            if (!authKey || authKey === 'YOUR_MSG91_AUTH_KEY_HERE') {
                console.warn('[MSG91] Missing Auth Key. Set MSG91_AUTH_KEY in .env');
            } else {
                const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId || ''}&mobile=91${cleanMobile}&otp=${otp}`;
                const response = await axios.get(url, {
                    headers: { authkey: authKey },
                    timeout: 10000
                });
                console.log('[MSG91 Success]:', response.data);
                return { success: true, provider: 'msg91', data: response.data };
            }
        }

        // 3. TWILIO (Global / India)
        if (provider === 'twilio' || process.env.TWILIO_ACCOUNT_SID) {
            const result = await twilioSendSMS(cleanMobile, message);
            if (result.success) {
                console.log('[Twilio Success]:', result);
                return { success: true, provider: 'twilio', data: result };
            }
        }

        // 4. DEV MODE / FALLBACK
        console.log('\n==================================================');
        console.log(`[DEV MODE SMS OTP]: ${otp}`);
        console.log(`[Target Mobile]: +91-${cleanMobile} (Masked: ${maskMobileNumber(cleanMobile)})`);
        console.log(`[Health ID]: ${healthId}`);
        console.log(`[Message]: ${message}`);
        console.log('==================================================\n');

        return {
            success: true,
            provider: 'dev_mode',
            message: 'OTP logged to server console (Dev Mode)'
        };

    } catch (error) {
        console.error('[SMS Dispatch Error]:', error.response?.data || error.message);
        // Fallback to dev mode so workflow doesn't crash during testing
        console.log(`[FALLBACK DEV OTP]: ${otp} for Health ID ${healthId}`);
        return {
            success: false,
            provider: provider || 'failed',
            error: error.message,
            fallbackDevMode: true
        };
    }
};

/**
 * Send OTP using MSG91 Widget API
 */
const sendMsg91WidgetOtp = async (toMobile) => {
    const cleanMobile = formatIndianMobile(toMobile);
    const authKey = process.env.MSG91_AUTH_KEY || '554542AcJOg3tIl06a683e57P1';
    const widgetId = process.env.MSG91_WIDGET_ID || '36674167374e353038313338';
    
    const identifier = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;

    try {
        const response = await axios.post(
            'https://api.msg91.com/api/v5/widget/sendOtp',
            {
                widgetId,
                identifier
            },
            {
                headers: {
                    authkey: authKey,
                    'content-type': 'application/json'
                },
                timeout: 10000
            }
        );

        if (response.data?.type === 'success') {
            const reqId = response.data.reqId || response.data.message;
            return { success: true, reqId, data: response.data };
        } else {
            throw new Error(response.data?.message || 'Failed to send OTP via MSG91 widget');
        }
    } catch (error) {
        const errMsg = error.response?.data?.message || error.message;
        console.error('[MSG91 Widget Send OTP Error]:', errMsg);
        throw new Error(errMsg);
    }
};

/**
 * Verify OTP using MSG91 Widget API
 */
const verifyMsg91WidgetOtp = async (reqId, otp) => {
    const authKey = process.env.MSG91_AUTH_KEY || '554542AcJOg3tIl06a683e57P1';
    const widgetId = process.env.MSG91_WIDGET_ID || '36674167374e353038313338';

    try {
        const response = await axios.post(
            'https://api.msg91.com/api/v5/widget/verifyOtp',
            {
                widgetId,
                reqId,
                otp: String(otp).trim()
            },
            {
                headers: {
                    authkey: authKey,
                    'content-type': 'application/json'
                },
                timeout: 10000
            }
        );

        if (response.data?.type === 'success') {
            return { success: true, message: response.data?.message || 'OTP verified successfully' };
        } else {
            return { success: false, message: response.data?.message || 'Invalid OTP' };
        }
    } catch (error) {
        const errMsg = error.response?.data?.message || error.message;
        console.error('[MSG91 Widget Verify OTP Error]:', errMsg);
        return { success: false, message: errMsg || 'OTP verification failed' };
    }
};

module.exports = {
    sendOtpSMS,
    sendMsg91WidgetOtp,
    verifyMsg91WidgetOtp,
    formatIndianMobile,
    maskMobileNumber
};
