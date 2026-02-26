const nodemailer = require('nodemailer');

const createTransporter = () => {
    // If SMTP is not explicitly configured, fallback to Ethereal or standard mock logging
    console.log(`✉️ Email Transporter initialized`);
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_PORT == 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

const sendSupervisorReport = async (supervisor, department, stats, pdfBuffer) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('⚠️ SMTP Credentials missing in environment configuration. Email dispatch aborted safely.');
            return false;
        }

        const transporter = createTransporter();

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

        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️ Mail sent dynamically to ${supervisor.email}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('Failed to send Supervisor email:', error);
        throw new Error('Email Dispatch Failed');
    }
};

module.exports = {
    sendSupervisorReport
};
