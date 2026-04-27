/**
 * Email Cron Job
 * Runs every 30 minutes to check for:
 *  - Due soon complaints (deadline < 12 hours away)
 *  - Overdue complaints (deadline passed, still unresolved)
 *
 * Features:
 *  - 10-minute cooldown per complaint after failure (prevents spam)
 *  - Per-complaint retry counter (max 3 attempts per cycle, then cooldown)
 *  - Errors are logged but never interrupt the server
 */
const cron = require('node-cron');
const Complaint = require('../models/Complaint');
const { sendDueSoonEmail, sendOverdueEmail } = require('../services/emailNotifier');
const { sendDueSoonWhatsApp, sendOverdueWhatsApp } = require('../services/notificationOrchestrator');

// In-memory cooldown tracker
const failedEmailCooldown = new Map();  // complaintId → { timestamp, retryCount }
const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes
const MAX_RETRIES = 3;

function getFailureInfo(complaintId) {
  return failedEmailCooldown.get(complaintId) || null;
}

function isOnCooldown(complaintId) {
  const info = getFailureInfo(complaintId);
  if (!info) return false;
  if (Date.now() - info.timestamp > COOLDOWN_MS) {
    failedEmailCooldown.delete(complaintId);
    return false;
  }
  // Still in cooldown AND exceeded max retries
  if (info.retryCount >= MAX_RETRIES) return true;
  return false;
}

function recordFailure(complaintId) {
  const existing = getFailureInfo(complaintId);
  const retryCount = existing ? existing.retryCount + 1 : 1;
  failedEmailCooldown.set(complaintId, { timestamp: Date.now(), retryCount });
}

function clearFailure(complaintId) {
  failedEmailCooldown.delete(complaintId);
}

function startEmailCron() {
  // Run every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('⏰ [Email Cron] Running SLA check...');
    try {
      const now = new Date();
      const twelveHoursLater = new Date(now.getTime() + 12 * 60 * 60 * 1000);

      const unresolvedComplaints = await Complaint.find({
        status: { $ne: 'Resolved' },
        slaDeadline: { $exists: true, $ne: null },
      });

      let dueSoonCount = 0;
      let overdueCount = 0;
      let skippedCount = 0;

      for (const complaint of unresolvedComplaints) {
        const cid = complaint._id.toString();

        if (isOnCooldown(cid)) {
          skippedCount++;
          continue;
        }

        const deadline = new Date(complaint.slaDeadline);

        try {
          if (deadline < now) {
            // ✉️ Email + 📱 WhatsApp run in parallel — neither blocks the other
            await Promise.allSettled([
              sendOverdueEmail(complaint),
              sendOverdueWhatsApp(complaint),
            ]);
            overdueCount++;
            clearFailure(cid);
          } else if (deadline <= twelveHoursLater) {
            await Promise.allSettled([
              sendDueSoonEmail(complaint),
              sendDueSoonWhatsApp(complaint),
            ]);
            dueSoonCount++;
            clearFailure(cid);
          }
        } catch (emailErr) {
          recordFailure(cid);
          const info = getFailureInfo(cid);
          console.error(`❌ [Email Cron] Email failed for #${cid.slice(-6)} (attempt ${info.retryCount}/${MAX_RETRIES}): ${emailErr.message}`);
        }
      }

      console.log(`⏰ [Email Cron] Done. Overdue: ${overdueCount}, Due Soon: ${dueSoonCount}${skippedCount ? `, Skipped: ${skippedCount}` : ''}`);
    } catch (err) {
      console.error(`❌ [Email Cron] Error: ${err.message}`);
    }
  });

  console.log('⏰ Email cron job scheduled (every 30 minutes)');
}

module.exports = { startEmailCron };
