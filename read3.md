Perform a complete stabilization of the PDF report generation and email notification system in the backend so it works reliably both locally and in the Render deployment environment.

Current errors observed in Render logs:

1. Puppeteer failure:

```
Could not find Chrome (ver. 146.0.7680.76)
cache path: /opt/render/.cache/puppeteer
```

2. SMTP failures:

```
connect ENETUNREACH 2607:f8b0:400e:c07::6d:465
Connection timeout
```

This indicates two root problems:

• Chromium is not installed in the Render container
• Gmail SMTP connection attempts use IPv6 which Render cannot route

Your task is to fix both systems permanently while keeping all existing application logic unchanged.

---

# PART 1 — Fix Puppeteer Chromium Installation

Ensure Chromium is installed during the Render build step.

Update `package.json`:

```json
"scripts": {
  "postinstall": "npx puppeteer browsers install chrome"
}
```

This forces Puppeteer to download Chromium when Render installs dependencies.

---

# PART 2 — Cross-Environment Puppeteer Launch

Update the PDF generation service so Puppeteer launches correctly both locally and on Render.

Use environment detection:

```javascript
const isProduction = process.env.NODE_ENV === "production";
```

Launch configuration:

```javascript
const browser = await puppeteer.launch({
  args: isProduction
    ? ["--no-sandbox", "--disable-setuid-sandbox"]
    : [],
  headless: true
});
```

Add clear error logging:

```
console.error("❌ Chromium launch failed:", error);
```

---

# PART 3 — Stabilize SMTP Transport

Replace any Gmail transport using IPv6 with forced IPv4 configuration.

Use:

```javascript
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

This forces IPv4 DNS resolution and prevents ENETUNREACH errors.

---

# PART 4 — Verify SMTP On Startup

Add a verification step when the server starts:

```javascript
transporter.verify()
  .then(() => console.log("✉️ SMTP transporter ready"))
  .catch(err => console.error("❌ SMTP verification failed:", err));
```

---

# PART 5 — Prevent Cron Email Flood

Cron currently retries failed emails continuously.

Add a retry protection system:

If an email fails for a complaint, store the complaint ID in a temporary in-memory map and skip retrying for 10 minutes.

---

# PART 6 — Improve PDF Generation Performance

Measure generation time:

```
console.time("PDF generation");
console.timeEnd("PDF generation");
```

Ensure browser instances are always closed:

```
await browser.close();
```

Add performance warnings if PDF generation exceeds 5 seconds.

---

# PART 7 — Add Diagnostic Endpoint

Create a temporary debugging route:

```
GET /api/admin/system-check
```

This endpoint must test:

1. Puppeteer launch
2. PDF generation
3. SMTP transporter verification
4. Email send test

Return structured diagnostics:

```
{
  pdf: "ok",
  chromium: "ok",
  smtp: "ok",
  email: "ok"
}
```

---

# PART 8 — Improve Logging

Use clear log prefixes:

```
❌ PDF generation error:
❌ SMTP send error:
⏱ PDF generation time: X ms
```

---

# PART 9 — Final Verification

After changes, verify:

- PDF export works locally
- PDF export works on Render
- Email sending works locally
- Email sending works on Render
- Cron SLA emails send successfully
- No SMTP IPv6 routing failures
- PDF generation completes within acceptable time

The system must be **fully stable for both local development and deployed environments**.
