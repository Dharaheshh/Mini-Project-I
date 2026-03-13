You are enhancing the Smart College Damage Reporting System with several UI improvements and a Smart Issue Radar widget.

IMPORTANT REQUIREMENT:
The system is already fully functional. You must NOT modify or break any existing backend logic, API routes, ML pipeline, complaint creation flow, or dashboard functionality.

All new features must be implemented as **non-invasive extensions** that only read existing data from MongoDB and display it in the UI.

Do NOT refactor existing components or change current data structures.

---

FEATURE 1 — DISPLAY SEVERITY IN UI

Severity is already produced by the ML pipeline and stored with each complaint.

Add severity display in the following places:

1. Admin Dashboard complaint table
   Add a "Severity" column.

Example:

Complaint | Category | Severity | Priority | Deadline | Status

2. Supervisor Dashboard complaint table
   Add the same "Severity" column.

3. Complaint Detail View
   Display severity inside the AI Assessment section.

Example:

## AI Assessment

Category: Pipe
Severity: Severe
Priority: High

---

SEVERITY BADGE DESIGN

Severity should appear as a colored badge.

Minor → green
Moderate → yellow
Severe → orange
Hazardous → red

Example UI:

[Severe]

Do not change existing priority badges.

---

FEATURE 2 — PRIORITY BASED DEADLINES

Currently deadlines use a fixed 3-day resolution time.

Update SLA calculation so deadlines depend on complaint priority.

Priority → Deadline

High → 1 day
Medium → 3 days
Low → 5 days

Backend implementation:

Create a constant mapping:

backend/constants/slaRules.js

Example:

export const SLA_BY_PRIORITY = {
High: 1,
Medium: 3,
Low: 5
}

When a complaint is created:

1. Read complaint priority
2. Get SLA days from the mapping
3. Calculate deadline from createdAt

Example logic:

slaDays = SLA_BY_PRIORITY[priority]

deadline = createdAt + slaDays

Store these additional fields in MongoDB:

slaDays
slaDeadline

Do not modify any existing complaint fields.

---

FEATURE 3 — DEADLINE VISIBILITY

Users must see deadlines for transparency.

Supervisors must see deadlines for task management.

Add deadline display in:

User Dashboard
Supervisor Dashboard
Admin Dashboard complaint table

Example:

Resolution Deadline: Mar 15

Optional display:

Mar 15 (2 days left)

---

FEATURE 4 — OVERDUE INDICATOR

If:

currentDate > slaDeadline
AND complaint status != "Resolved"

Show badge:

⚠ Overdue

This must be calculated dynamically without modifying stored complaint data.

---

FEATURE 5 — COMPLAINT IMAGE PREVIEW

Improve complaint list UI by showing a small image thumbnail.

Add a small preview image in complaint tables.

Example layout:

[thumbnail] Bench Damage | Block CSE-A | Status: Open

Thumbnail size:

40–50px square with rounded corners.

Do not modify existing image upload logic.

---

FEATURE 6 — STATUS PROGRESS TRACKER

Convert complaint status history into a visual progress tracker.

Example:

Submitted ✔
In Progress ✔
Resolved ○

Use the existing statusHistory data already stored in complaints.

Do not modify how status updates are stored.

---

FEATURE 7 — URGENT ISSUES WIDGET

Add a small dashboard widget for urgent issues.

Widget title:

🚨 Urgent Issues

Logic:

Count complaints where:

priority = "High"
status != "Resolved"

Example display:

3 High Priority Complaints need attention

This should appear at the top of the Admin Dashboard.

---

FEATURE 8 — SMART ISSUE RADAR

Add a new dashboard widget called:

Smart Issue Radar

Purpose:

Show which campus blocks currently have the most urgent complaints.

Implementation must use a MongoDB aggregation query.

Aggregation logic:

1. Filter complaints where status != "Resolved"
2. Group complaints by block
3. Count High / Medium / Low priority complaints per block

Example aggregation output:

[
{ block: "CSE-A", high: 3, medium: 1, low: 0 },
{ block: "ECE-B", high: 1, medium: 2, low: 1 }
]

UI example:

Smart Issue Radar

🔴 CSE-A Block
3 High Priority Issues

🟠 ECE-B Block
2 Medium Priority Issues

🟢 MECH-C Block
1 Low Priority Issue

If any complaint in a block is overdue:

Highlight the block with an alert indicator.

Example:

🚨 CSE-A Block
2 Overdue Issues

---

IMPLEMENTATION RULES

Do not modify:

ML server logic
Complaint submission flow
Existing API routes
Authentication system
Existing dashboards

All features must only:

Read existing complaint data
Add UI indicators and widgets
Add SLA deadline calculation

---

FINAL GOAL

Enhance the system with:

Severity visibility
Priority-based SLA deadlines
Image previews
Status progress tracking
Urgent issues monitoring
Smart Issue Radar

while keeping the current system stable and unchanged.
