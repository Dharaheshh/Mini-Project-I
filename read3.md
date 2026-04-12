You are a senior Node.js infrastructure engineer tasked with fixing two production issues in a MERN-based microservice system called Smart Campus Damage Reporter.

The system generates PDF reports using Puppeteer and sends them via Gmail SMTP using Nodemailer.

The application works perfectly in local development, but issues occur when deployed to Render cloud containers.

The system must also remain compatible with future Docker, Kubernetes, and AWS deployments.

Problem 1 — PDF Layout Broken in Render

Locally generated PDFs render correctly.

On Render:

layout spacing is broken

alignment is inconsistent

fonts look different

elements shift positions

Root cause:

Render containers do not include system fonts, causing Chromium to substitute fallback fonts which breaks layout.

Required Fix

Modify the PDF generation system to ensure consistent rendering across environments.

Implement the following changes.

1 Install Standard Fonts

Ensure the container installs fonts used in the HTML templates.

Required fonts:

fonts-liberation
fonts-noto
fonts-dejavu

If Docker is used later, the Dockerfile must include:

apt-get update
apt-get install -y \
fonts-liberation \
fonts-noto \
fonts-dejavu \
fontconfig
2 Embed Fonts in CSS

Update the HTML report template to use explicit fonts instead of system defaults.

Example CSS:

body {
  font-family: "DejaVu Sans", "Liberation Sans", Arial, sans-serif;
}

Avoid relying on default browser fonts.

3 Force Puppeteer Rendering Settings

Update Puppeteer launch configuration.

const browser = await puppeteer.launch({
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--font-render-hinting=none"
  ],
  headless: true
});
4 Set Explicit Viewport

Before rendering HTML:

await page.setViewport({
  width: 1200,
  height: 800,
  deviceScaleFactor: 1
});
5 Wait for Layout to Fully Render

Add rendering delay before generating PDF.

await page.setContent(html, {
  waitUntil: "networkidle0"
});

await page.evaluateHandle("document.fonts.ready");
6 Use Proper PDF Options
const pdf = await page.pdf({
  format: "A4",
  printBackground: true,
  margin: {
    top: "20px",
    right: "20px",
    bottom: "20px",
    left: "20px"
  }
});
Problem 2 — Gmail SMTP Timeout on Render

Email sending works locally but fails in Render.

Logs show:

Connection timeout
connect ENETUNREACH 2607:f8b0:400e::465

Root cause:

Render attempts IPv6 SMTP connection to Gmail.

Required Fix

Refactor Nodemailer transport configuration to enforce IPv4 and improve reliability.

Update Transport Configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,

  family: 4,

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
Add Email Retry Logic

If email sending fails, retry up to 3 times.

maxRetries = 3
retryDelay = 5 seconds

This prevents cron job spam and increases reliability.

Cron Job Improvements

Your SLA cron currently floods logs when emails fail.

Add:

retry protection

error suppression

failure tracking

Example logic:

if (retryCount >= 3) {
  log failure
  skip sending
}
Expected Final Behavior

When admin exports department report:

Flow:

Admin dashboard
↓
Backend export endpoint
↓
Generate HTML report
↓
Puppeteer renders HTML
↓
Fonts load correctly
↓
Consistent PDF layout generated
↓
PDF attached to email
↓
Nodemailer sends email using IPv4 SMTP

PDF layout must be identical across local and Render deployments.

Email sending must not timeout.

Implementation Deliverables

Update Puppeteer launch configuration

Ensure fonts are available

Embed fonts in report templates

Update SMTP configuration

Add retry logic to email sender

Improve cron failure handling

Constraints

Do NOT:

dynamically install Chrome during runtime

rely on system default fonts

remove Puppeteer

The solution must remain compatible with Docker, Kubernetes, and AWS deployment environments.