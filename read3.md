

Your current problems come from:

* **Puppeteer needing a full Chrome environment**
* **SMTP networking instability**
* **Platform-dependent dependencies**

For **containerized / cloud-native systems**, the best approach is:

✅ **Headless Chromium with puppeteer-core** (container controlled)
✅ **API-based email provider (Resend / SES)** instead of SMTP
✅ **Environment-aware config**
✅ **Stateless PDF generation service**

This works **locally → Docker → Kubernetes → AWS** without breaking.

Below is the **DETAILED PROMPT for your Antigravity agent**.

You can paste it directly.

---

# Prompt for Antigravity Agent

You are a **senior backend infrastructure engineer** tasked with fixing **PDF generation and email delivery reliability** in a production-style MERN + FastAPI microservice project.

The system is a **Smart Campus Damage Reporter** deployed on **Render currently**, but it must be redesigned to work reliably across:

* Local development
* Docker containers
* Kubernetes clusters
* AWS infrastructure

The current stack:

Frontend
React (Vite)
TailwindCSS
Axios

Backend
Node.js
Express.js
MongoDB Atlas

ML Server
FastAPI
PyTorch

Deployment targets
Render (current)
Docker
Kubernetes
AWS (future)

---

# Current Problems

## Problem 1 — PDF Generation Failure

Current implementation uses **Puppeteer with bundled Chromium**.

Error:

```
Could not find Chrome
Could not launch browser
```

Render containers do not ship with Chrome, and installation attempts using:

```
npx puppeteer browsers install chrome
```

fail in many environments.

This approach is **not reliable for containerized environments**.

---

## Problem 2 — Email Delivery Failure

Emails currently use **Nodemailer + Gmail SMTP**.

Errors:

```
connect ENETUNREACH 2607:f8b0:400e::465
Connection timeout
```

Root cause:

* Render attempting IPv6 SMTP connection
* Gmail SMTP instability
* SMTP not ideal for containerized deployments

---

# Required Architecture Changes

The system must be redesigned for **cloud-native reliability**.

Key requirements:

* Must work in **Docker containers**
* Must scale in **Kubernetes**
* Must deploy easily to **AWS ECS / EKS**
* Must work in **serverless environments**
* Must not rely on host-installed Chrome

---

# Solution Design

## 1 — Replace Puppeteer with puppeteer-core + Sparticuz Chromium

Install:

```
npm install puppeteer-core @sparticuz/chromium
```

This allows using a **portable headless chromium binary** compatible with containers.

Implementation requirements:

* Launch puppeteer using chromium executable path
* Support serverless and container runtime
* Avoid puppeteer bundled browser downloads

Example expected implementation:

```javascript
const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

const browser = await puppeteer.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath(),
  headless: chromium.headless
});

const page = await browser.newPage();
await page.setContent(htmlTemplate);

const pdfBuffer = await page.pdf({
  format: "A4",
  printBackground: true
});

await browser.close();
```

The PDF generator should return a **Buffer** that can be:

* downloaded
* emailed
* stored

---

## 2 — Refactor PDF Generation into a Service Layer

Create a reusable service:

```
services/pdfService.js
```

Responsibilities:

* Accept HTML template
* Launch chromium
* generate PDF
* return buffer

This service must be **stateless**.

---

## 3 — Replace SMTP with API-based Email Service

SMTP should be removed.

Use an **email API provider**.

Preferred options:

1️⃣ AWS SES (best for AWS future deployment)
2️⃣ Resend API (simpler dev experience)

Implementation must support:

```
EMAIL_PROVIDER=resend | ses
```

Environment-based switching.

---

### Example Resend Implementation

Install:

```
npm install resend
```

Service:

```
services/emailService.js
```

Example:

```javascript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html, attachments }) {

  await resend.emails.send({
    from: "Campus Reporter <alerts@campus.ai>",
    to,
    subject,
    html,
    attachments
  });

}
```

Attachments should support **PDF buffers**.

---

## 4 — Container Friendly Setup

Update project for container environments.

Requirements:

* No dependency on system Chrome
* No runtime browser installation
* All dependencies resolved via npm

---

## 5 — Docker Compatibility

Ensure PDF generation works inside containers.

Expected Dockerfile pattern:

```
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

Chromium must be handled by **@sparticuz/chromium**, not OS packages.

---

## 6 — Kubernetes Compatibility

Ensure system is **stateless**.

PDF generation should:

* generate buffer
* send response
* close browser

No filesystem writes.

---

## 7 — Fix Cron Email System

Cron job currently floods logs when email fails.

Implement:

* retry limit
* exponential backoff
* failure logging

Example:

```
maxRetries: 3
retryDelay: 5 minutes
```

---

# Final Expected System Behavior

Admin exports department report.

Flow:

```
Admin dashboard
      ↓
Backend endpoint
      ↓
Generate HTML report
      ↓
pdfService converts HTML → PDF
      ↓
PDF returned to user
      ↓
Optional: emailService sends PDF attachment
```

This architecture must run reliably in:

* Local dev
* Docker containers
* Kubernetes pods
* AWS infrastructure

---

# Deliverables Expected from Agent

1. Refactor PDF generation into `pdfService`
2. Replace Puppeteer with puppeteer-core + Sparticuz Chromium
3. Replace SMTP with API email provider
4. Implement `emailService`
5. Ensure Docker compatibility
6. Remove platform-specific hacks
7. Update report export endpoint
8. Ensure attachments work for email reports

---

# Critical Requirements

Do NOT:

* reinstall Chrome dynamically
* rely on system binaries
* use Gmail SMTP

The solution must be **cloud-native and container-friendly**.


