/**
 * Email Notifier Service
 * Sends automated email alerts to supervisors for:
 *  - High priority complaints (immediate)
 *  - Approaching SLA deadlines (due soon)
 *  - Overdue complaints
 *
 * Uses the existing Nodemailer + Gmail SMTP config.
 * Errors are logged but NEVER block the complaint workflow.
 */
const nodemailer = require('nodemailer');
const User = require('../models/User');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Reuse transporter across calls
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
    console.log('📧 Email Notifier transporter initialized (service: gmail)');
  }
  return transporter;
}

/**
 * Fetch supervisor email from MongoDB by department.
 * Falls back to SMTP_USER if no supervisor found.
 */
async function getSupervisorEmail(department) {
  try {
    const supervisor = await User.findOne({ role: 'supervisor', department });
    if (supervisor && supervisor.email) {
      return supervisor.email;
    }
    console.warn(`⚠️ No supervisor found for dept "${department}" — falling back to SMTP_USER`);
    return process.env.SMTP_USER;
  } catch (err) {
    console.error(`❌ Error fetching supervisor email: ${err.message}`);
    return process.env.SMTP_USER;
  }
}

// ──────────────────────────────────────────────
// 1. HIGH PRIORITY ALERT
// ──────────────────────────────────────────────
async function sendHighPriorityEmail(complaint) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️ SMTP not configured — skipping high priority email');
      return;
    }

    const to = await getSupervisorEmail(complaint.assignedDepartment);
    const complaintLink = `${FRONTEND_URL}/complaints/${complaint._id}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Campus Alert System" <alert@campus.edu>',
      to,
      subject: `🚨 High Priority Infrastructure Issue — ${complaint.category}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">🚨 High Priority Complaint Reported</h1>
          </div>
          <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280; width: 120px;">Category</td><td style="padding: 8px 0; font-weight: 600;">${complaint.category}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Severity</td><td style="padding: 8px 0; font-weight: 600; color: #dc2626;">${complaint.severity || 'Unknown'}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Location</td><td style="padding: 8px 0; font-weight: 600;">${complaint.location}${complaint.classroom ? ' / ' + complaint.classroom : ''}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Priority</td><td style="padding: 8px 0; font-weight: 700; color: #dc2626;">HIGH</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Complaint ID</td><td style="padding: 8px 0; font-weight: 600;">#${complaint._id.toString().slice(-6)}</td></tr>
            </table>
            ${complaint.image?.url ? `<div style="margin: 16px 0;"><img src="${complaint.image.url}" alt="Damage Image" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb;" /></div>` : ''}
            <p style="color: #dc2626; font-weight: 600; margin: 16px 0;">⚠️ Immediate attention required.</p>
            <a href="${complaintLink}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Complaint →</a>
            <p style="margin-top: 24px; font-size: 11px; color: #9ca3af;">This is an automated alert from the Campus Damage Reporting System.</p>
          </div>
        </div>
      `,
    };

    const info = await getTransporter().sendMail(mailOptions);
    console.log(`📧 HIGH PRIORITY email sent to ${to} — msgId: ${info.messageId}`);
  } catch (err) {
    console.error(`❌ Failed to send high priority email: ${err.message}`);
  }
}

// ──────────────────────────────────────────────
// 2. DUE SOON ALERT
// ──────────────────────────────────────────────
async function sendDueSoonEmail(complaint) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

    const to = await getSupervisorEmail(complaint.assignedDepartment);
    const complaintLink = `${FRONTEND_URL}/complaints/${complaint._id}`;
    const deadline = new Date(complaint.slaDeadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Campus Alert System" <alert@campus.edu>',
      to,
      subject: `⚠️ SLA Deadline Approaching — ${complaint.category} at ${complaint.location}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">⚠️ SLA Deadline Approaching</h1>
          </div>
          <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 15px; color: #374151;"><strong>Reminder:</strong> Complaint nearing SLA deadline.</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280; width: 120px;">Complaint ID</td><td style="padding: 8px 0; font-weight: 600;">#${complaint._id.toString().slice(-6)}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Category</td><td style="padding: 8px 0; font-weight: 600;">${complaint.category}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Location</td><td style="padding: 8px 0; font-weight: 600;">${complaint.location}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Deadline</td><td style="padding: 8px 0; font-weight: 700; color: #d97706;">${deadline}</td></tr>
            </table>
            <p style="color: #d97706; font-weight: 600;">Please resolve before the deadline.</p>
            <a href="${complaintLink}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 12px;">View Complaint →</a>
            <p style="margin-top: 24px; font-size: 11px; color: #9ca3af;">Automated SLA monitoring alert.</p>
          </div>
        </div>
      `,
    };

    const info = await getTransporter().sendMail(mailOptions);
    console.log(`📧 DUE SOON email sent to ${to} for complaint #${complaint._id.toString().slice(-6)} — msgId: ${info.messageId}`);
  } catch (err) {
    console.error(`❌ Failed to send due-soon email: ${err.message}`);
  }
}

// ──────────────────────────────────────────────
// 3. OVERDUE ALERT
// ──────────────────────────────────────────────
async function sendOverdueEmail(complaint) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

    const to = await getSupervisorEmail(complaint.assignedDepartment);
    const complaintLink = `${FRONTEND_URL}/complaints/${complaint._id}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Campus Alert System" <alert@campus.edu>',
      to,
      subject: `🚨 Complaint Overdue — ${complaint.category} at ${complaint.location}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #991b1b, #7f1d1d); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">🚨 Complaint Overdue</h1>
          </div>
          <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 15px; color: #374151;"><strong>Urgent:</strong> Complaint has exceeded SLA deadline.</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280; width: 120px;">Complaint ID</td><td style="padding: 8px 0; font-weight: 600;">#${complaint._id.toString().slice(-6)}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Category</td><td style="padding: 8px 0; font-weight: 600;">${complaint.category}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Location</td><td style="padding: 8px 0; font-weight: 600;">${complaint.location}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Deadline</td><td style="padding: 8px 0; font-weight: 700; color: #dc2626;">EXCEEDED</td></tr>
            </table>
            ${complaint.image?.url ? `<div style="margin: 16px 0;"><img src="${complaint.image.url}" alt="Damage Image" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb;" /></div>` : ''}
            <p style="color: #dc2626; font-weight: 700;">⚠️ Immediate action required.</p>
            <a href="${complaintLink}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 12px;">View Complaint →</a>
            <p style="margin-top: 24px; font-size: 11px; color: #9ca3af;">Automated SLA monitoring alert.</p>
          </div>
        </div>
      `,
    };

    const info = await getTransporter().sendMail(mailOptions);
    console.log(`📧 OVERDUE email sent to ${to} for complaint #${complaint._id.toString().slice(-6)} — msgId: ${info.messageId}`);
  } catch (err) {
    console.error(`❌ Failed to send overdue email: ${err.message}`);
  }
}

module.exports = {
  sendHighPriorityEmail,
  sendDueSoonEmail,
  sendOverdueEmail,
};
