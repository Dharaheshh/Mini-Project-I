/**
 * emailService.js
 * Sends supervisor PDF report emails via Nodemailer + Gmail SMTP.
 *
 * Features:
 *  - IPv4 enforced (family: 4) to avoid Render ENETUNREACH
 *  - Retry logic: up to 3 attempts with 5-second delays
 *  - Connection timeouts for reliability
 */
const nodemailer = require('nodemailer');

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        family: 4,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
    });
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const sendSupervisorReport = async (supervisor, department, stats, pdfBuffer) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️ SMTP credentials missing — email dispatch skipped.');
        return false;
    }

    const mailOptions = {
        from: process.env.SMTP_FROM || '"Admin Portal" <admin@college.edu>',
        to: supervisor.email,
        subject: `${department.charAt(0).toUpperCase() + department.slice(1)} Monthly Activity Report`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #2563eb;">Department Action Report</h2>
          <p>Hello ${supervisor.name},</p>
          <p>Please find attached the latest auto-generated report detailing the complaint density and operational status for your specific department domain.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h3 style="margin-top: 0; color: #475569;">Quick Summary: ${department.toUpperCase()}</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin-bottom: 8px;">📊 <strong>Total Department Issues:</strong> ${stats.total}</li>
              <li style="margin-bottom: 8px;">⏳ <strong>Active / Pending:</strong> <span style="color: #ea580c;">${stats.pending}</span></li>
              <li>✅ <strong>Successfully Resolved:</strong> <span style="color: #16a34a;">${stats.resolved}</span></li>
            </ul>
          </div>
          
          <p>The detailed graphical breakdowns and location hotspots can be found inside the <strong>attached PDF file</strong>.</p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #64748b;">
            This is an automated system dispatch. Do not reply to this email thread.
          </p>
        </div>
      `,
        attachments: [
            {
                filename: `${department}-report.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf',
            },
        ],
    };

    // Retry loop
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const transporter = createTransporter();
            console.log(`📧 Sending supervisor report to: ${supervisor.email} (attempt ${attempt}/${MAX_RETRIES})`);
            const info = await transporter.sendMail(mailOptions);
            console.log(`✉️ Supervisor report sent to ${supervisor.email}: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error(`❌ SMTP send error (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`);
            if (attempt < MAX_RETRIES) {
                console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
                await sleep(RETRY_DELAY_MS);
            } else {
                throw new Error(`Email dispatch failed after ${MAX_RETRIES} attempts: ${error.message}`);
            }
        }
    }
};

module.exports = { sendSupervisorReport };
