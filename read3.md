Fix backend email dispatch and PDF export errors occurring in the deployed Render environment.

Current symptoms:
- POST /api/admin/export-report returns 500
- POST /api/admin/export-department-report returns 500
- POST /api/admin/send-department-report returns 500
- Frontend shows "Server error during SMTP email dispatch"

These operations work locally but fail after deployment.

Root causes likely include:
1) Puppeteer failing to launch Chromium on Render
2) Missing or incorrectly loaded SMTP environment variables
3) Lack of error logging around PDF generation and email transport

Required fixes:

1. Update Puppeteer usage for Render compatibility
Replace default Puppeteer launch with:

const browser = await puppeteer.launch({
  args: ['--no-sandbox','--disable-setuid-sandbox'],
  headless: true
});

Ensure Puppeteer does not depend on a system-installed Chromium.

2. Add detailed logging
Wrap PDF generation and nodemailer calls in try/catch blocks and log errors clearly:

console.error("PDF generation error:", error);
console.error("SMTP send error:", error);

3. Verify SMTP configuration
Ensure nodemailer transporter reads environment variables correctly:

host: process.env.SMTP_HOST
port: Number(process.env.SMTP_PORT)
auth: {
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS
}

4. Add environment validation on server startup

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn("SMTP credentials missing");
}

5. Ensure PDF generation runs before email dispatch and returns file buffer correctly.

6. Ensure API responses return detailed backend errors instead of silent 500 failures.

Goal:
Make PDF export and email dispatch fully functional in Render production environment without modifying existing business logic or UI.

IMPORTANT: I HOSTED BACKEND AND ML SERVER IN RENDER AND FRONTEND IN VERCEL AND FACING THE ABOVE PROBLEMS SO FIX ACCORDINGLY DONT CHANGE CORE LOGIC OF PROJECT