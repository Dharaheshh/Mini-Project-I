Refactor the severity detection logic in the ML server to improve the accuracy and realism of severity estimation.

IMPORTANT REQUIREMENT:

Do NOT modify the existing API structure, endpoint names, response schema, or core inference pipeline.

The existing system must continue to function exactly the same from the perspective of the backend and frontend.

Only improve the internal implementation of the severity detection logic.

---

CURRENT PROBLEM

The existing severity detector relies mainly on image brightness, contrast, and color diversity.

This approach produces unrealistic results because lighting conditions do not reliably indicate infrastructure damage severity.

---

NEW APPROACH

Replace the current pixel-statistics method with a hybrid severity detection system that combines:

1. Category-aware severity rules
2. Edge detection to estimate structural damage

This approach is lightweight, deterministic, and suitable for deployment environments with limited RAM.

---

SEVERITY DETECTION PIPELINE

The severity detector must now operate as follows:

Step 1:
Receive the predicted category from the classifier.

Step 2:
Perform lightweight edge detection on the image using OpenCV.

Example implementation:

* Convert image to grayscale
* Apply Canny edge detection
* Calculate edge density

Edge density = number_of_edge_pixels / total_pixels

Step 3:
Combine category information with edge density to determine severity.

---

CATEGORY-AWARE SEVERITY LOGIC

Example logic rules:

Electrical Socket
→ Default severity = Hazardous

Pipe / Plumbing
→ Default severity = Severe

Bench / Chair
→ Default severity = Minor

Projector / Equipment
→ Default severity = Moderate

---

EDGE DENSITY ADJUSTMENT

Edge density indicates visible structural damage.

If edge density is high:
Increase severity level by one level.

Example mapping:

edge_density > 0.25
→ damage likely severe

edge_density > 0.15
→ moderate damage

edge_density < 0.05
→ minor damage

---

SEVERITY OUTPUT FORMAT

The severity detector must still return the same response format used by the current system:

Tuple:

(severity_string, severity_score)

Example:

("Severe", 0.7)

Valid severity strings must remain:

Minor
Moderate
Severe
Hazardous

---

PRIORITY LOGIC

Do not change the priority logic implementation.

Priority must continue to be derived from severity.

---

ADMIN AND SUPERVISOR DASHBOARD

Ensure that priority is clearly visible in both dashboards.

In the complaint list tables add a Priority column:

Complaint | Category | Priority | Status | Deadline

Priority must be color coded:

High → Red
Medium → Orange
Low → Green

Priority should also appear in the complaint detail page.

---

PERFORMANCE REQUIREMENTS

The severity model must remain lightweight and safe for Docker deployment.

Constraints:

* Avoid loading large ML models
* Keep memory usage low
* Maintain inference speed under 500ms
* Do not affect the existing category classifier

---

GOAL

Upgrade the severity detection system so it produces more realistic results while keeping the rest of the system stable and fully compatible with the current architecture.
