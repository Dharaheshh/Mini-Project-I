/**
 * SLA Rules - Maps priority levels to resolution deadline (in days).
 * Used when creating a complaint to calculate the slaDeadline.
 */
const SLA_BY_PRIORITY = {
  High: 1,
  Medium: 3,
  Low: 5,
};

/**
 * Calculate SLA deadline from a given date and priority.
 * @param {Date} fromDate - The complaint creation date
 * @param {string} priority - Priority level (High, Medium, Low)
 * @returns {{ slaDays: number, slaDeadline: Date }}
 */
function calculateSLA(fromDate, priority) {
  const slaDays = SLA_BY_PRIORITY[priority] || 3; // Default to 3 days (Medium)
  const slaDeadline = new Date(fromDate);
  slaDeadline.setDate(slaDeadline.getDate() + slaDays);
  return { slaDays, slaDeadline };
}

module.exports = { SLA_BY_PRIORITY, calculateSLA };
