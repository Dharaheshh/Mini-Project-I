You are a senior staff-level backend engineer working directly inside my existing project codebase.

Your task is to inspect the ENTIRE repository first, understand the current architecture, then implement a production-ready WhatsApp notification system for issue creation events.

Do NOT blindly generate isolated code. First understand how the project currently works, then integrate cleanly into the existing structure.

---

# PHASE 1: FULL CODEBASE ANALYSIS (MANDATORY FIRST)

Before writing code:

## Inspect and understand:

1. Folder structure
2. Backend architecture
3. Existing routes/controllers/services
4. Database models / schemas
5. Issue creation workflow
6. Existing notification systems (email/SMS/etc.)
7. Environment config system
8. Logging utilities
9. Error handling patterns
10. Naming conventions
11. Middleware/auth patterns

## Then summarize:

* Current backend stack
* How issues are created now
* Best integration points
* Existing patterns to reuse
* Risks before implementation

Do this BEFORE modifying files.

---

# PHASE 2: FEATURE TO BUILD

Implement WhatsApp notifications when a new issue is created.

Workflow:

1. New issue created
2. Check if duplicate notification
3. If duplicate → skip WhatsApp send
4. If not duplicate:

   * Notify admin personal number
   * Notify department-specific WhatsApp group
5. Save notification logs
6. Return clean success/failure states

---

# DUPLICATE DETECTION RULES

USE THE EXISTING DUPLICATE DETECTION LOGIC IN THE CODEBASE.

# DEPARTMENT ROUTING

Map issue types dynamically:

* electrical → group ID
* civil → group ID
* plumbing → group ID
* carpentry → group ID
* network → group ID

Use env or config, not hardcoded values.

Fallback:

* If no mapping found, notify admin only and log warning.

---

# MESSAGE FORMAT

Use professional readable WhatsApp message:

🚨 New Campus Issue Reported

📍 Location: {location}
🛠 Type: {issueType}
⚠ Severity: {severity}
📝 Description: {description}
🕒 Reported: {timestamp}
🎫 Ticket ID: {ticketId}
🔗 Dashboard: {optional_link}
whatever meta data available with us use it  if not create em
---

# TECHNICAL REQUIREMENTS

Use existing stack and conventions.

Prefer:

* Node.js
* Express
* Existing DB models
* Existing logger if present
* Existing config loader

Use async/await.

No duplicate business logic if reusable modules already exist.

---

# CREATE / MODIFY FILES INTELLIGENTLY

Only add files if needed.

Possible structure:

* services/whatsappService.js
* services/notificationService.js
* services/duplicateCheckService.js
* config/whatsappConfig.js
* models/NotificationLog.js
* routes/testNotificationRoutes.js

But adapt to current codebase patterns.

---

# WHATSAPP API INTEGRATION

Use Meta WhatsApp Cloud API.

Use environment variables:

```env id="4vso7x"
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
ADMIN_WHATSAPP_NUMBER=
DASHBOARD_URL=
GROUP_ELECTRICAL=
GROUP_CIVIL=
GROUP_PLUMBING=
GROUP_CARPENTRY=
GROUP_NETWORK=
```

Never hardcode secrets.

---

# LOGGING REQUIREMENTS

Track:

* issueId
* recipient
* recipientType
* messageType
* status
* sentAt
* retries
* apiResponse
* errorMessage

Statuses:

* pending
* sent
* failed
* skipped_duplicate
* retrying

---

# ERROR HANDLING

Handle:

* Missing env vars
* Invalid token
* Network timeout
* WhatsApp API errors
* Missing group mapping
* DB save failures

Do not crash issue creation flow if WhatsApp fails.
Issue creation must still succeed.

---

# RETRY LOGIC (BONUS)

If send fails:

* Retry up to 3 times
* Exponential or fixed delay
* Log each attempt

---

# TESTING

Create test routes if suitable:

POST /api/test/whatsapp
POST /api/test/issue-notification

Provide sample payloads.

---

# OUTPUT FORMAT REQUIRED

1. Codebase analysis summary
2. Files created / modified
3. Full code changes
4. Integration explanation
5. .env additions
6. How to test
7. Future scalability ideas

---

# IMPORTANT RULES

* Inspect first, code second
* Preserve existing project style
* Minimal invasive changes
* Production quality
* Readable modular code
* Avoid duplicate logic
* If better architecture exists in codebase, use it

Think like a senior engineer joining a live project and shipping safely.

USer colab added