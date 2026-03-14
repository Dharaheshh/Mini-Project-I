Fix cross-environment compatibility issues affecting:

1. Puppeteer PDF generation
2. Nodemailer SMTP email dispatch

The application works locally but fails in the Render production environment due to:

• Puppeteer sandbox restrictions on Render
• Gmail SMTP connection timeouts caused by IPv6 routing issues

The goal is to make both PDF generation and email dispatch work reliably in **both local development and production** without changing any existing application logic.

---

### 1️⃣ Fix Puppeteer Cross-Environment Launch

Update the Puppeteer launch configuration to detect production environment and apply sandbox flags only when running on Render.

Implement:

```
const isProduction = process.env.NODE_ENV === "production";

const browser = await puppeteer.launch(
  isProduction
    ? {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        headless: true
      }
    : {
        headless: true
      }
);
```

This ensures:

Local → default Chromium launch
Render → sandbox disabled for container security restrictions.

---

### 2️⃣ Replace Manual SMTP Config With Gmail Service Transport

Remove manual SMTP configuration using:

```
host: smtp.gmail.com
port: 587
```

Instead use Nodemailer’s Gmail service transport to avoid IPv6 connection timeouts.

Implement:

```
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
```

This ensures stable connections from Render infrastructure.

---

### 3️⃣ Add SMTP Timeouts & Logging

Improve reliability and debugging:

```
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000
});
```

Add logging before sending emails:

```
console.log("📧 Sending email to:", recipientEmail);
```

Catch and log errors clearly:

```
console.error("SMTP send error:", error);
```

---

### 4️⃣ Ensure Environment Variables Load Correctly

Confirm the following variables are used consistently:

```
SMTP_USER
SMTP_PASS
SMTP_FROM
```

Convert port values using:

```
Number(process.env.SMTP_PORT)
```

if still referenced anywhere.

---

### 5️⃣ Maintain Existing Business Logic

Do NOT modify:

• cron SLA logic
• report generation logic
• complaint workflow
• notification logic
• API routes

Only improve environment compatibility for Puppeteer and SMTP.

Goal: PDF export and email dispatch must work both locally and in the Render deployment environment.
