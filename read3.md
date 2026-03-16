Perform a full diagnostic and stabilization of the **PDF report generation and email dispatch system** in the Smart College Damage Reporting backend.

The system currently works partially but suffers from multiple cross-environment failures in Render and inconsistent behavior locally.

Observed errors include:

* Chromium launch failures
* SMTP connection timeouts
* ENETUNREACH IPv6 SMTP errors
* Long-running PDF generation causing request delays
* Cron job repeatedly attempting failed email dispatch

Your task is to **audit and repair the entire PDF + email pipeline end-to-end** while keeping all business logic intact.

IMPORTANT RULES

Do NOT modify:

* complaint logic
* ML inference logic
* SLA logic
* cron scheduling logic
* API routes
* frontend behavior

Only improve **PDF generation reliability, SMTP email transport stability, and cross-environment compatibility**.

---

# 1️⃣ Validate Environment Configuration

Add a startup validation module that checks required environment variables:

Required variables:

MONGODB_URI
SMTP_USER
SMTP_PASS
SMTP_FROM
FRONTEND_URL
NODE_ENV

Log clear warnings if any are missing.

Example:

console.warn("⚠ Missing SMTP credentials");

---

# 2️⃣ Fix Cross-Environment Puppeteer Configuration

Ensure Puppeteer launches correctly both locally and on Render.

Use environment-aware browser launch:

```
const isProduction = process.env.NODE_ENV === "production";
```

Production launch (Render):

```
puppeteer.launch({
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
  headless: true
})
```

Local launch:

```
puppeteer.launch({
  headless: true
})
```

Add explicit error logging for Chromium launch failures.

---

# 3️⃣ Optimize PDF Generation Performance

PDF generation must not block email dispatch excessively.

Add performance timing:

```
console.time("PDF Generation");
console.timeEnd("PDF Generation");
```

If generation exceeds **5 seconds**, log a warning.

Ensure page rendering uses:

```
waitUntil: "networkidle0"
```

Reduce unnecessary HTML complexity.

Close browser instances properly:

```
await browser.close();
```

to avoid memory leaks.

---

# 4️⃣ Stabilize SMTP Transport

Replace any unstable SMTP configuration.

Use explicit Gmail SMTP with IPv4 enforcement:

```
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000
});
```

Add verification on server startup:

```
transporter.verify()
```

Log success or failure.

---

# 5️⃣ Improve Email Dispatch Reliability

Before sending emails:

Log target address:

```
console.log("📧 Sending email to:", recipient);
```

Wrap email sending in try/catch with detailed logging.

Ensure the PDF buffer is generated successfully before attaching.

Prevent sending empty attachments.

---

# 6️⃣ Prevent Cron Email Spam

Cron jobs currently retry failed sends repeatedly.

Add temporary in-memory protection:

```
recentEmailAttempts = new Map()
```

If the same complaint email fails within the last **10 minutes**, skip retry.

Log skipped attempts.

---

# 7️⃣ Add Diagnostic Endpoint

Create a temporary debugging route:

```
GET /api/admin/system-check
```

This endpoint must test:

1. Puppeteer launch
2. PDF generation
3. SMTP transporter verification
4. email send test

Return structured diagnostics:

```
{
  pdf: "ok",
  chromium: "ok",
  smtp: "ok",
  email: "ok"
}
```

This helps confirm production stability.

---

# 8️⃣ Improve Logging

Standardize logs with clear prefixes:

PDF errors:

```
❌ PDF generation error:
```

SMTP errors:

```
❌ SMTP send error:
```

Cron errors:

```
❌ Cron email error:
```

Performance logs:

```
⏱ PDF generation time: X ms
```

---

# 9️⃣ Maintain Backward Compatibility

Ensure:

Local development still works without cloud-specific dependencies.

Render deployment must not require manual Chromium installation.

The system must run successfully with:

Local Node runtime
Render Node runtime

---

# FINAL GOAL

After implementation:

* PDF export works locally
* PDF export works on Render
* Email sending works locally
* Email sending works on Render
* Cron SLA emails send successfully
* No SMTP IPv6 routing failures
* PDF generation completes within acceptable time

The system must be **fully stable for both local development and deployed environments**.
