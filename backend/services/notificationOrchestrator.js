/**
 * notificationOrchestrator.js
 * Orchestrates the full WhatsApp notification flow for new complaints.
 * 
 * Workflow:
 *  1. Check if complaint is a duplicate → skip if yes (log as skipped_duplicate)
 *  2. Build formatted WhatsApp message
 *  3. Send to ADMIN personal number
 *  4. Send to department supervisor number
 *  5. Save WhatsAppLog for each attempt
 * 
 * Also exports SLA alert functions used by emailCron.js:
 *  - sendDueSoonWhatsApp(complaint)
 *  - sendOverdueWhatsApp(complaint)
 * 
 * NEVER throws — always catches internally so complaint creation flow is unaffected.
 */
const whatsappService = require('./whatsappService');
const { getDepartmentNumber } = require('../config/whatsappGroups');
const WhatsAppLog = require('../models/WhatsAppLog');
const User = require('../models/User');

const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:3000';

// ─── Message Builders ─────────────────────────────────────────────────────────

function buildNewComplaintMessage(complaint) {
    const reportedAt = new Date(complaint.createdAt).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
    const ticketId = complaint._id.toString().slice(-6).toUpperCase();
    const priorityEmoji = complaint.priority === 'High' ? '🔴' : complaint.priority === 'Medium' ? '🟠' : '🟢';
    const severityEmoji = complaint.severity === 'Hazardous' ? '☢️' : complaint.severity === 'Severe' ? '⚠️' : complaint.severity === 'Moderate' ? '🟡' : '🟢';

    return (
        `🚨 *New Campus Issue Reported*\n\n` +
        `📍 *Location:* ${complaint.location}${complaint.classroom ? ` / ${complaint.classroom}` : ''}\n` +
        `🛠 *Category:* ${complaint.category}\n` +
        `${severityEmoji} *Severity:* ${complaint.severity || 'Unknown'}\n` +
        `${priorityEmoji} *Priority:* ${complaint.priority}\n` +
        `📋 *Department:* ${complaint.assignedDepartment || 'Unassigned'}\n` +
        `📝 *Description:* ${complaint.note || 'No description provided'}\n` +
        `🕒 *Reported:* ${reportedAt}\n` +
        `🎫 *Ticket ID:* #${ticketId}\n` +
        `📅 *SLA Deadline:* ${complaint.slaDeadline ? new Date(complaint.slaDeadline).toLocaleDateString('en-IN') : 'N/A'}\n` +
        `👤 *Reported By:* ${complaint.user?.name || 'Unknown'}\n\n` +
        `🔗 *Dashboard:* ${DASHBOARD_URL}/complaints/${complaint._id}`
    );
}

function buildDueSoonMessage(complaint) {
    const deadline = new Date(complaint.slaDeadline).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
    const ticketId = complaint._id.toString().slice(-6).toUpperCase();
    return (
        `⚠️ *SLA Deadline Approaching*\n\n` +
        `Complaint *#${ticketId}* is due soon and needs attention.\n\n` +
        `📍 *Location:* ${complaint.location}\n` +
        `🛠 *Category:* ${complaint.category}\n` +
        `⏰ *Deadline:* ${deadline}\n` +
        `📋 *Department:* ${complaint.assignedDepartment || 'Unassigned'}\n\n` +
        `Please resolve before the deadline.\n` +
        `🔗 ${DASHBOARD_URL}/complaints/${complaint._id}`
    );
}

function buildOverdueMessage(complaint) {
    const ticketId = complaint._id.toString().slice(-6).toUpperCase();
    return (
        `🚨 *Complaint OVERDUE*\n\n` +
        `Complaint *#${ticketId}* has exceeded its SLA deadline!\n\n` +
        `📍 *Location:* ${complaint.location}\n` +
        `🛠 *Category:* ${complaint.category}\n` +
        `📋 *Department:* ${complaint.assignedDepartment || 'Unassigned'}\n` +
        `❌ *Deadline:* EXCEEDED\n\n` +
        `⚠️ *Immediate action required!*\n` +
        `🔗 ${DASHBOARD_URL}/complaints/${complaint._id}`
    );
}

// ─── Log Helper ───────────────────────────────────────────────────────────────

async function saveLog(data) {
    try {
        await WhatsAppLog.create(data);
    } catch (err) {
        console.error(`❌ [WhatsApp] Failed to save log: ${err.message}`);
    }
}

// ─── Supervisor Number Lookup ─────────────────────────────────────────────────

async function getSupervisorNumber(department) {
    // First, check env-based config
    const envNumber = getDepartmentNumber(department);
    if (envNumber) return envNumber;

    // Fallback: try to find a supervisor user with a phone field in DB (future-proof)
    try {
        const supervisor = await User.findOne({ role: 'supervisor', department });
        if (supervisor && supervisor.phone) return supervisor.phone;
    } catch (err) {
        // Ignore DB errors silently
    }

    // Final fallback: admin number
    console.warn(`⚠️ [WhatsApp] No supervisor number for "${department}" — falling back to admin number`);
    return process.env.ADMIN_WHATSAPP_NUMBER;
}

// ─── New Complaint Notification ───────────────────────────────────────────────

/**
 * Main entry point called from complaints.js after new complaint is saved.
 * Fire-and-forget safe — never throws.
 * @param {Object} complaint - Populated Mongoose complaint document
 */
async function notifyNewComplaint(complaint) {
    try {
        if (!whatsappService.isReady()) return;

        // DUPLICATE CHECK: If ML flagged as duplicate, skip WhatsApp entirely
        if (complaint.duplicate === true) {
            console.log(`🔁 [WhatsApp] Skipping — complaint #${complaint._id.toString().slice(-6)} is a duplicate`);
            await saveLog({
                complaint: complaint._id,
                recipient: process.env.ADMIN_WHATSAPP_NUMBER,
                recipientType: 'admin',
                department: complaint.assignedDepartment,
                messageType: 'new_complaint',
                status: 'skipped_duplicate',
            });
            return;
        }

        const message = buildNewComplaintMessage(complaint);
        const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;

        // 1. Notify Admin
        const adminResult = await whatsappService.sendTextMessage(adminNumber, message);
        await saveLog({
            complaint: complaint._id,
            recipient: adminNumber,
            recipientType: 'admin',
            department: complaint.assignedDepartment,
            messageType: complaint.priority === 'High' ? 'high_priority' : 'new_complaint',
            status: adminResult.success ? 'sent' : 'failed',
            retries: adminResult.success ? 0 : 3,
            apiResponse: adminResult.messageId,
            errorMessage: adminResult.error,
            sentAt: adminResult.success ? new Date() : undefined,
        });

        // 2. Notify Department Supervisor
        const supervisorNumber = await getSupervisorNumber(complaint.assignedDepartment);
        if (supervisorNumber && supervisorNumber !== adminNumber) {
            const deptResult = await whatsappService.sendTextMessage(supervisorNumber, message);
            await saveLog({
                complaint: complaint._id,
                recipient: supervisorNumber,
                recipientType: 'department_supervisor',
                department: complaint.assignedDepartment,
                messageType: complaint.priority === 'High' ? 'high_priority' : 'new_complaint',
                status: deptResult.success ? 'sent' : 'failed',
                retries: deptResult.success ? 0 : 3,
                apiResponse: deptResult.messageId,
                errorMessage: deptResult.error,
                sentAt: deptResult.success ? new Date() : undefined,
            });
        }
    } catch (err) {
        console.error(`❌ [WhatsApp] notifyNewComplaint error: ${err.message}`);
    }
}

// ─── SLA Alert: Due Soon ──────────────────────────────────────────────────────

/**
 * Send WhatsApp alert when a complaint is approaching its SLA deadline.
 * Called from cron/emailCron.js alongside the existing email alert.
 */
async function sendDueSoonWhatsApp(complaint) {
    try {
        if (!whatsappService.isReady()) return;

        const message = buildDueSoonMessage(complaint);
        const supervisorNumber = await getSupervisorNumber(complaint.assignedDepartment);

        const result = await whatsappService.sendTextMessage(supervisorNumber, message);
        await saveLog({
            complaint: complaint._id,
            recipient: supervisorNumber,
            recipientType: 'department_supervisor',
            department: complaint.assignedDepartment,
            messageType: 'sla_due_soon',
            status: result.success ? 'sent' : 'failed',
            retries: result.success ? 0 : 3,
            apiResponse: result.messageId,
            errorMessage: result.error,
            sentAt: result.success ? new Date() : undefined,
        });
    } catch (err) {
        console.error(`❌ [WhatsApp] sendDueSoonWhatsApp error: ${err.message}`);
    }
}

// ─── SLA Alert: Overdue ───────────────────────────────────────────────────────

/**
 * Send WhatsApp alert when a complaint has exceeded its SLA deadline.
 * Called from cron/emailCron.js alongside the existing email alert.
 */
async function sendOverdueWhatsApp(complaint) {
    try {
        if (!whatsappService.isReady()) return;

        const message = buildOverdueMessage(complaint);
        const supervisorNumber = await getSupervisorNumber(complaint.assignedDepartment);

        // Also always ping admin for overdue
        const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;
        const result = await whatsappService.sendTextMessage(supervisorNumber, message);
        await saveLog({
            complaint: complaint._id,
            recipient: supervisorNumber,
            recipientType: 'department_supervisor',
            department: complaint.assignedDepartment,
            messageType: 'sla_overdue',
            status: result.success ? 'sent' : 'failed',
            retries: result.success ? 0 : 3,
            apiResponse: result.messageId,
            errorMessage: result.error,
            sentAt: result.success ? new Date() : undefined,
        });

        // Ping admin too for overdue (if different number)
        if (adminNumber && adminNumber !== supervisorNumber) {
            const adminResult = await whatsappService.sendTextMessage(adminNumber, message);
            await saveLog({
                complaint: complaint._id,
                recipient: adminNumber,
                recipientType: 'admin',
                department: complaint.assignedDepartment,
                messageType: 'sla_overdue',
                status: adminResult.success ? 'sent' : 'failed',
                retries: adminResult.success ? 0 : 3,
                apiResponse: adminResult.messageId,
                errorMessage: adminResult.error,
                sentAt: adminResult.success ? new Date() : undefined,
            });
        }
    } catch (err) {
        console.error(`❌ [WhatsApp] sendOverdueWhatsApp error: ${err.message}`);
    }
}

module.exports = {
    notifyNewComplaint,
    sendDueSoonWhatsApp,
    sendOverdueWhatsApp,
};
