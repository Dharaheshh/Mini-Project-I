/**
 * Email Cron Job
 * Runs every 30 minutes to check for:
 *  - Due soon complaints (deadline < 12 hours away)
 *  - Overdue complaints (deadline passed, still unresolved)
 *
 * Sends email alerts via emailNotifier service.
 * Errors are logged but never interrupt the server.
 */
const cron = require('node-cron');
const Complaint = require('../models/Complaint');
const { sendDueSoonEmail, sendOverdueEmail } = require('../services/emailNotifier');

function startEmailCron() {
  // Run every 30 minutes
  cron.schedule('*/1 * * * *', async () => {
    console.log('⏰ [Email Cron] Running SLA check...');
    try {
      const now = new Date();
      const twelveHoursLater = new Date(now.getTime() + 12 * 60 * 60 * 1000);

      // Find all unresolved complaints with an SLA deadline
      const unresolvedComplaints = await Complaint.find({
        status: { $ne: 'Resolved' },
        slaDeadline: { $exists: true, $ne: null },
      });

      let dueSoonCount = 0;
      let overdueCount = 0;

      for (const complaint of unresolvedComplaints) {
        const deadline = new Date(complaint.slaDeadline);

        if (deadline < now) {
          // OVERDUE
          await sendOverdueEmail(complaint);
          overdueCount++;
        } else if (deadline <= twelveHoursLater) {
          // DUE SOON (within 12 hours)
          await sendDueSoonEmail(complaint);
          dueSoonCount++;
        }
      }

      console.log(`⏰ [Email Cron] Done. Overdue: ${overdueCount}, Due Soon: ${dueSoonCount}`);
    } catch (err) {
      console.error(`❌ [Email Cron] Error: ${err.message}`);
    }
  });

  console.log('⏰ Email cron job scheduled (every 30 minutes)');
}

module.exports = { startEmailCron };
