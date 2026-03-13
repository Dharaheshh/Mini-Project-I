Perform a **complete frontend visual transformation** of the Smart College Damage Reporting System.

IMPORTANT

This is a **pure UI/UX redesign task**.

DO NOT modify:

* backend APIs
* database schema
* ML logic
* complaint workflows
* routing logic

The system functionality must remain **100% unchanged**.

Only redesign the **visual layer**.

---

# DESIGN DIRECTION

Use the **Login Page design as the visual foundation for the entire application**.

The login page already has a modern SaaS aesthetic with:

* dark blue gradient
* soft shadows
* rounded cards
* modern typography
* smooth buttons

Apply this **same design language consistently across the entire dashboard**.

The goal is to make the whole system feel like **one coherent product**, not separate screens.

---

# REMOVE PURPLE DESIGN SYSTEM

Currently the UI still uses many **purple theme elements**.

Remove all purple-based color styling.

Replace it with the **login page blue/teal gradient palette**.

Primary theme colors:

Deep Blue
Teal
Slate Gray

Priority colors remain:

High → Red
Medium → Orange
Low → Green

---

# REMOVE MEANINGLESS ICON BACKGROUND CIRCLES

Some dashboard widgets contain **large faded circular shapes behind icons**.

These circles add no meaning and create visual clutter.

Remove these circular decorations.

Instead use:

clean icon containers
subtle gradient backgrounds
small rounded icon boxes

Example improvement:

Instead of:

large faded circle behind icon

Use:

small rounded square icon container.

---

# DASHBOARD CARD REDESIGN

Redesign dashboard statistic cards.

Current cards look inconsistent.

New design:

clean rounded cards
subtle gradient border or icon background
balanced spacing
larger number emphasis

Example layout:

Icon
Title
Metric value
Trend indicator

Add subtle hover elevation.

---

# ENSURE DASHBOARD WIDGETS SHOW REAL DATA

Some widgets such as the **heatmap statistics cards above the map** appear without values.

Ensure all metric cards correctly display their values using existing frontend state data.

Examples:

Total Issues
High Priority
Pending
Resolved

Do not change backend logic.

Only fix the UI so values appear properly.

---

# GLOBAL CARD SYSTEM

Create a unified card style used everywhere:

dashboard cards
report cards
heatmap container
notification panels

Card style:

rounded-xl
shadow-md
border-slate-200
consistent padding

Use subtle hover animation.

---

# DROPDOWN REDESIGN

Current dropdowns look like basic browser components.

Replace them with styled dropdowns that match the login page theme.

Requirements:

rounded menus
soft shadows
smooth open animation
hover highlight

Remove default browser appearance.

Ensure consistent padding and typography.

---

# TABLE AND REPORT LIST IMPROVEMENTS

Improve the report table UI.

Enhancements:

row hover highlight
rounded container
clean separators
thumbnail previews

Improve readability by adjusting spacing and typography.

---

# GROUPING STRUCTURE

Admin and Student dashboards:

Group reports by **Department**.

Infrastructure
Electrical
Plumbing

Each section must be collapsible.

Display report counts.

Example:

🔧 Infrastructure (12)

---

Supervisor dashboard:

Group reports by **Status**.

Submitted
In Progress
Resolved

Sections must be collapsible.

Submitted and In Progress expanded by default.

---

# NOTIFICATION PANEL IMPROVEMENT

Improve the notifications dropdown.

Add icons for notification types:

ℹ info
✔ resolved
🚨 urgent

Add hover highlight.

Add a **View complaint** action link.

---

# HEATMAP PAGE POLISH

Improve the heatmap container layout.

Add proper stat widgets above the map.

Ensure all values display correctly.

Use the same card design system.

---

# FORM INPUT DESIGN

Standardize form fields across the entire application.

Use:

rounded inputs
consistent padding
subtle borders
focus glow

Match the login page input style.

---

# BUTTON SYSTEM

Create consistent button styles.

Primary buttons:

gradient background
rounded-lg
smooth hover animation

Secondary buttons:

outline style
subtle hover background

---

# MICRO INTERACTIONS

Add subtle animations:

card hover lift
button hover glow
dropdown open animation
chart load animation

Keep animations minimal and smooth.

---

# FINAL GOAL

Transform the entire UI into a **modern SaaS-style dashboard** using the login page as the design reference.

The application should feel like a **professional production product**, not a basic admin panel.

Again:

NO backend changes
NO logic changes
NO API changes

Only visual transformation.
