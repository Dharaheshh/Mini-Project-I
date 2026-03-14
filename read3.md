Fix cross-platform Puppeteer PDF generation so it works both locally and on Render.

Current error on Render:

```
Could not find Chrome (ver. 146.0.7680.76)
cache path: /opt/render/.cache/puppeteer
```

This occurs because Render does not automatically install Chromium for Puppeteer.

The solution is to use a cross-platform Chromium package.

---

### 1️⃣ Install required packages

Add the following dependencies:

```
npm install puppeteer-core @sparticuz/chromium
```

Remove the direct dependency on `puppeteer` if present.

---

### 2️⃣ Update PDF generation code

Modify the Puppeteer launch configuration to support both environments.

Example implementation:

```javascript
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const isProduction = process.env.NODE_ENV === "production";

async function launchBrowser() {
  if (isProduction) {
    return await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });
  } else {
    const puppeteerLocal = require("puppeteer");
    return await puppeteerLocal.launch({
      headless: true
    });
  }
}
```

Use `launchBrowser()` everywhere PDF generation requires Puppeteer.

---

### 3️⃣ Update Render build command

Ensure Render installs Chromium dependencies during build.

Add to Render build command if necessary:

```
npm install
```

No manual Chrome installation should be required after switching to `@sparticuz/chromium`.

---

### 4️⃣ Add error logging

Wrap Puppeteer launch with clear logging:

```javascript
try {
  const browser = await launchBrowser();
} catch (error) {
  console.error("❌ Chromium launch failed:", error);
  throw new Error("PDF generation failed: Could not launch browser");
}
```

---

### 5️⃣ Maintain existing logic

Do NOT modify:

• report generation logic
• email logic
• cron SLA logic
• API routes
• frontend behavior

Only improve the Puppeteer launch mechanism.

Goal: PDF generation must work reliably on both **local development environments and Render deployment**.
