/**
 * whatsappGroups.js
 * Maps departments to their supervisor WhatsApp phone numbers.
 * 
 * Pattern mirrors config/supervisorEmails.js — all values come from env vars.
 * Phone numbers must be in international format WITHOUT + prefix (e.g., "917418739758" for +91-7418739758)
 * 
 * To add a new department, add an env var and a mapping entry here.
 */
const WHATSAPP_DEPARTMENT_NUMBERS = {
    infrastructure: process.env.GROUP_INFRASTRUCTURE,
    electrical:     process.env.GROUP_ELECTRICAL,
    plumbing:       process.env.GROUP_PLUMBING,
};

/**
 * Look up the WhatsApp number for a given department.
 * Returns null if not configured, so callers can fall back gracefully.
 * @param {string} department
 * @returns {string|null}
 */
function getDepartmentNumber(department) {
    const number = WHATSAPP_DEPARTMENT_NUMBERS[department];
    if (!number) {
        console.warn(`⚠️ [WhatsApp] No number configured for department: "${department}"`);
        return null;
    }
    return number;
}

module.exports = { WHATSAPP_DEPARTMENT_NUMBERS, getDepartmentNumber };
