/**
 * whatsappService.js
 * Core client for Meta WhatsApp Cloud API.
 * 
 * Handles:
 *  - Sending text messages with retry + exponential backoff
 *  - Uploading PDF buffers as WhatsApp media (document messages)
 *  - Never throws — always returns { success, messageId, error }
 *  - Startup env validation + token age warning
 * 
 * API Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */
const axios = require('axios');
const FormData = require('form-data');

const BASE_URL = 'https://graph.facebook.com/v21.0';
const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [2000, 4000, 8000]; // Exponential backoff

// ─── Env Validation ──────────────────────────────────────────────────────────

function validateEnv() {
    const required = [
        'WHATSAPP_ACCESS_TOKEN',
        'WHATSAPP_PHONE_NUMBER_ID',
        'ADMIN_WHATSAPP_NUMBER',
    ];
    const missing = required.filter(k => !process.env[k]);
    if (missing.length > 0) {
        console.warn(`⚠️  [WhatsApp] Missing env vars: ${missing.join(', ')} — WhatsApp features will be skipped.`);
        return false;
    }
    // Token age warning: Meta tokens expire after ~60 days if not refreshed
    console.log('✅ [WhatsApp] Service initialized. Ensure WHATSAPP_ACCESS_TOKEN is refreshed before expiry.');
    console.log('ℹ️  [WhatsApp] To refresh: Meta Business Suite → System Users → Generate New Token');
    return true;
}

let isConfigured = false;

function isReady() {
    if (!isConfigured) {
        isConfigured = validateEnv();
    }
    return isConfigured;
}

// ─── Sleep Helper ─────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Send Text Message ────────────────────────────────────────────────────────

/**
 * Send a plain text WhatsApp message to a phone number.
 * @param {string} to - Recipient phone in E.164 without '+' (e.g., "917418739758")
 * @param {string} text - The message body (supports *bold* and _italic_ formatting)
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
async function sendTextMessage(to, text) {
    if (!isReady()) {
        return { success: false, error: 'WhatsApp not configured' };
    }

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.WHATSAPP_ACCESS_TOKEN;

    const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
    };

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await axios.post(
                `${BASE_URL}/${phoneNumberId}/messages`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 15000,
                }
            );
            const messageId = response.data?.messages?.[0]?.id;
            console.log(`📱 [WhatsApp] Message sent to ${to} — ID: ${messageId}`);
            return { success: true, messageId };
        } catch (err) {
            const errMsg = err.response?.data?.error?.message || err.message;
            const errCode = err.response?.data?.error?.code;

            // Check for expired token (code 190) — no point retrying
            if (errCode === 190) {
                console.error(`❌ [WhatsApp] Access token expired (code 190). Please refresh WHATSAPP_ACCESS_TOKEN in .env`);
                console.error(`   → Meta Business Suite → System Users → Generate New Token`);
                return { success: false, error: `Token expired: ${errMsg}` };
            }

            console.warn(`⚠️  [WhatsApp] Send attempt ${attempt}/${MAX_RETRIES} failed: ${errMsg}`);

            if (attempt < MAX_RETRIES) {
                await sleep(RETRY_DELAYS_MS[attempt - 1]);
            } else {
                console.error(`❌ [WhatsApp] All ${MAX_RETRIES} attempts failed for ${to}`);
                return { success: false, error: errMsg };
            }
        }
    }
}

// ─── Upload PDF Media ─────────────────────────────────────────────────────────

/**
 * Upload a PDF buffer to WhatsApp Media API and return the media_id.
 * @param {Buffer} pdfBuffer
 * @param {string} filename - e.g., "infrastructure-report.pdf"
 * @returns {Promise<{ success: boolean, mediaId?: string, error?: string }>}
 */
async function uploadPdfMedia(pdfBuffer, filename) {
    if (!isReady()) {
        return { success: false, error: 'WhatsApp not configured' };
    }

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.WHATSAPP_ACCESS_TOKEN;

    const formData = new FormData();
    formData.append('messaging_product', 'whatsapp');
    formData.append('type', 'application/pdf');
    formData.append('file', pdfBuffer, {
        filename,
        contentType: 'application/pdf',
    });

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await axios.post(
                `${BASE_URL}/${phoneNumberId}/media`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        ...formData.getHeaders(),
                    },
                    timeout: 30000,
                }
            );
            const mediaId = response.data?.id;
            console.log(`📎 [WhatsApp] PDF uploaded — media_id: ${mediaId}`);
            return { success: true, mediaId };
        } catch (err) {
            const errMsg = err.response?.data?.error?.message || err.message;
            const errCode = err.response?.data?.error?.code;

            if (errCode === 190) {
                console.error(`❌ [WhatsApp] Access token expired. Refresh WHATSAPP_ACCESS_TOKEN.`);
                return { success: false, error: `Token expired: ${errMsg}` };
            }

            console.warn(`⚠️  [WhatsApp] Media upload attempt ${attempt}/${MAX_RETRIES} failed: ${errMsg}`);

            if (attempt < MAX_RETRIES) {
                await sleep(RETRY_DELAYS_MS[attempt - 1]);
            } else {
                return { success: false, error: errMsg };
            }
        }
    }
}

// ─── Send PDF Document Message ────────────────────────────────────────────────

/**
 * Upload a PDF and then send it as a WhatsApp document message.
 * @param {string} to - Recipient phone number
 * @param {Buffer} pdfBuffer - The PDF file content
 * @param {string} filename - e.g., "infrastructure-report.pdf"
 * @param {string} caption - Caption text shown with the document
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
async function sendPdfDocument(to, pdfBuffer, filename, caption) {
    if (!isReady()) {
        return { success: false, error: 'WhatsApp not configured' };
    }

    // Step 1: Upload PDF to Meta media servers
    const uploadResult = await uploadPdfMedia(pdfBuffer, filename);
    if (!uploadResult.success) {
        return { success: false, error: `Media upload failed: ${uploadResult.error}` };
    }

    // Step 2: Send document message with media_id
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.WHATSAPP_ACCESS_TOKEN;

    const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'document',
        document: {
            id: uploadResult.mediaId,
            filename,
            caption,
        },
    };

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await axios.post(
                `${BASE_URL}/${phoneNumberId}/messages`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 15000,
                }
            );
            const messageId = response.data?.messages?.[0]?.id;
            console.log(`📄 [WhatsApp] PDF sent to ${to} — ID: ${messageId}`);
            return { success: true, messageId };
        } catch (err) {
            const errMsg = err.response?.data?.error?.message || err.message;
            const errCode = err.response?.data?.error?.code;

            if (errCode === 190) {
                console.error(`❌ [WhatsApp] Access token expired. Refresh WHATSAPP_ACCESS_TOKEN.`);
                return { success: false, error: `Token expired: ${errMsg}` };
            }

            console.warn(`⚠️  [WhatsApp] Document send attempt ${attempt}/${MAX_RETRIES} failed: ${errMsg}`);

            if (attempt < MAX_RETRIES) {
                await sleep(RETRY_DELAYS_MS[attempt - 1]);
            } else {
                return { success: false, error: errMsg };
            }
        }
    }
}

module.exports = {
    isReady,
    sendTextMessage,
    sendPdfDocument,
};
