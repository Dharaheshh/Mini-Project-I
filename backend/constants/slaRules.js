/**
 * SLA Rules - Maps severity levels to resolution deadline (in days).
 * Used when creating a complaint to calculate the slaDeadline.
 */
const SLA_BY_SEVERITY = {
  Hazardous: 1,
  Severe: 2,
  Moderate: 3,
  Minor: 5,
};

/**
 * Calculate SLA deadline from a given date and severity.
 * @param {Date} fromDate - The complaint creation date
 * @param {string} severity - Severity level (Hazardous, Severe, Moderate, Minor)
 * @returns {{ slaDays: number, slaDeadline: Date }}
 */
function calculateSLA(fromDate, severity) {
  const slaDays = SLA_BY_SEVERITY[severity] || 3; // Default to 3 days (Moderate)
  const slaDeadline = new Date(fromDate);
  slaDeadline.setDate(slaDeadline.getDate() + slaDays);
  return { slaDays, slaDeadline };
}

module.exports = { SLA_BY_SEVERITY, calculateSLA };
