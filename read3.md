Implement two UI and SLA improvements in the Smart College Damage Reporting System.

IMPORTANT:
Do not modify or break any existing logic. The system is already working correctly. Only extend the current implementation.

---

FEATURE 1 — DISPLAY SEVERITY IN UI

The ML pipeline already produces the following values:

category
severity
priority

Severity must now be clearly visible in the UI for transparency.

Add severity display in the following places:

1. Admin Dashboard
   In the complaint table add a column:

Severity

Example row:

Complaint | Category | Severity | Priority | Deadline | Status

2. Supervisor Dashboard
   Add the same "Severity" column in the complaint list.

3. Complaint Detail View
   Display severity in the AI analysis section.

Example:

## AI Assessment

Category: Pipe
Severity: Severe
Priority: High

---

SEVERITY BADGE DESIGN

Severity should be displayed using color-coded badges.

Minor → green
Moderate → yellow
Severe → orange
Hazardous → red

Example UI:

[Severe]

---

FEATURE 2 — PRIORITY BASED DEADLINES

Currently the deadline logic uses a fixed 3-day resolution time.

Update the SLA logic so deadlines depend on complaint priority.

Priority → Deadline

High → 1 day
Medium → 3 days
Low → 5 days

---

BACKEND IMPLEMENTATION

Create a constant mapping:

backend/constants/slaRules.js

Example:

export const SLA_BY_PRIORITY = {
High: 1,
Medium: 3,
Low: 5
}

When a complaint is created:

1. Read the complaint priority
2. Get SLA days from the mapping
3. Calculate deadline from the complaint creation date

Example logic:

slaDays = SLA_BY_PRIORITY[priority]

deadline = createdAt + slaDays

Store in MongoDB:

slaDays
slaDeadline

---

UI DEADLINE DISPLAY

Show the deadline in both:

User Dashboard
Supervisor Dashboard

Example display:

Resolution Deadline: Mar 15

Optionally show remaining time:

Mar 15 (2 days left)

---

OVERDUE INDICATOR

If the complaint is not resolved and current date > slaDeadline:

Show badge:

Overdue

Example:

⚠ Overdue

---

IMPORTANT REQUIREMENTS

Do not change the ML pipeline.
Do not change complaint submission logic.
Do not break existing dashboards.
Only extend the UI and SLA calculation.
