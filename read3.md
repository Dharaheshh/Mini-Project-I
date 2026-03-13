Implement an automated Email Alert System in the Smart College Damage Reporting System.

IMPORTANT REQUIREMENT

The system is already stable and fully functional. Do NOT modify or break any existing backend logic, ML pipelines, complaint creation routes, database schemas, or UI components.

All alert functionality must be implemented as a **separate modular email service** that runs alongside the current system.

---

PLATFORM

Use the existing Nodemailer + Gmail SMTP setup already configured in the project.

Environment variables already available:

EMAIL_USER
EMAIL_PASS
FRONTEND_URL

---

CREATE EMAIL SERVICE

Create a new service:

backend/services/emailNotifier.js

Responsibilities:

• Initialize Nodemailer transporter
• Format email messages
• Send alerts to supervisors
• Attach complaint images
• Include dashboard link

---

SUPERVISOR EMAIL CONFIG

Create a configuration file:

backend/config/supervisorEmails.js

Example:

const SUPERVISOR_EMAILS = {
electrical: "[electrical_supervisor@email.com](mailto:electrical_supervisor@email.com)",
plumbing: "[plumbing_supervisor@email.com](mailto:plumbing_supervisor@email.com)",
infrastructure: "[infrastructure_supervisor@email.com](mailto:infrastructure_supervisor@email.com)"
};

module.exports = SUPERVISOR_EMAILS;

This allows easy updates without modifying logic.

---

ALERT TRIGGERS

The system must send email alerts for three situations.

---

1. HIGH PRIORITY COMPLAINT CREATED

When a complaint is created and priority === "High":

Immediately send an email to the appropriate supervisor.

Subject:

🚨 High Priority Infrastructure Issue

Email Body Example:

High Priority Complaint Reported

Category: Electrical
Severity: Hazardous
Location: CSE-A / F001

Complaint ID: #143

Immediate attention required.

View complaint:
${FRONTEND_URL}/complaints/{complaintId}

Attach the complaint image if available.

---

2. DEADLINE APPROACHING (DUE SOON)

If the complaint deadline is approaching.

Condition:

deadline - current time < 12 hours

Send reminder email.

Subject:

⚠ SLA Deadline Approaching

Email Body Example:

Reminder: Complaint nearing SLA deadline

Complaint: #143
Category: Pipe Leak
Location: CSE-A

Deadline: Today

Please resolve before the deadline.

Dashboard link:
${FRONTEND_URL}/complaints/{complaintId}

---

3. OVERDUE COMPLAINT

If:

current time > slaDeadline
AND complaint status != "Resolved"

Send urgent alert email.

Subject:

🚨 Complaint Overdue

Email Body Example:

Urgent: Complaint has exceeded SLA deadline

Complaint: #143
Category: Electrical
Location: CSE-A

Deadline exceeded.

Immediate action required.

Dashboard link:
${FRONTEND_URL}/complaints/{complaintId}

---

IMAGE ATTACHMENT

If a complaint image exists:

Attach the image in the email or include it as a preview link.

---

CRON JOB FOR MONITORING

Create:

backend/cron/emailCron.js

Use node-cron.

Run every 30 minutes to check unresolved complaints.

Steps:

1. Query complaints where status !== "Resolved"
2. Check if deadline approaching (<12 hours)
3. Check if overdue
4. Send appropriate email alert

---

HIGH PRIORITY TRIGGER

Modify the complaint creation controller.

After complaint.save() and after sending the API response:

Add a fire-and-forget email alert.

Example:

if (complaint.priority === "High") {
const { sendHighPriorityEmail } = require("../services/emailNotifier");
sendHighPriorityEmail(complaint).catch(err => console.error("Email alert error:", err.message));
}

This must NOT block the complaint creation response.

---

ERROR HANDLING

If email sending fails:

• Log the error
• Do NOT interrupt the complaint creation process
• The system must continue operating normally

---

TESTING

Test with the three supervisor email addresses already configured.

Verify that:

• High priority complaints trigger email alerts
• Due soon reminders send correctly
• Overdue complaints trigger urgent alerts

---

FINAL GOAL

Create an automated alert system where supervisors receive email notifications when:

• High priority complaints are created
• SLA deadlines are approaching
• Complaints become overdue

Emails must include complaint details, image preview, and a direct dashboard link.
