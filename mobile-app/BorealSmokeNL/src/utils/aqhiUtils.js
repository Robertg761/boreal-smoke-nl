/**
 * AQHI (Air Quality Health Index) Utilities
 * Centralized functions for AQHI color, label, and risk level management
 */

// AQHI thresholds and their corresponding values
const AQHI_LEVELS = {
  LOW: { max: 3, label: 'Low Risk', color: '#00C851', emoji: '😊' },
  MODERATE: { max: 6, label: 'Moderate Risk', color: '#FFD600', emoji: '😐' },
  HIGH: { max: 10, label: 'High Risk', color: '#FF8800', emoji: '😷' },
  VERY_HIGH: { max: Infinity, label: 'Very High Risk', color: '#FF3D00', emoji: '🚨' },
};

/**
 * Get AQHI color based on value
 * @param {number} value - AQHI value
 * @returns {string} Hex color code
 */
export const getAQHIColor = (value) => {
  if (value == null || value <= 0) return AQHI_LEVELS.LOW.color;
  if (value <= AQHI_LEVELS.LOW.max) return AQHI_LEVELS.LOW.color;
  if (value <= AQHI_LEVELS.MODERATE.max) return AQHI_LEVELS.MODERATE.color;
  if (value <= AQHI_LEVELS.HIGH.max) return AQHI_LEVELS.HIGH.color;
  return AQHI_LEVELS.VERY_HIGH.color;
};

/**
 * Get AQHI label based on value
 * @param {number} value - AQHI value
 * @returns {string} Risk level label
 */
export const getAQHILabel = (value) => {
  if (value == null || value <= 0) return AQHI_LEVELS.LOW.label;
  if (value <= AQHI_LEVELS.LOW.max) return AQHI_LEVELS.LOW.label;
  if (value <= AQHI_LEVELS.MODERATE.max) return AQHI_LEVELS.MODERATE.label;
  if (value <= AQHI_LEVELS.HIGH.max) return AQHI_LEVELS.HIGH.label;
  return AQHI_LEVELS.VERY_HIGH.label;
};

/**
 * Get risk level identifier
 * @param {number} value - AQHI value
 * @returns {string} Risk level (low, moderate, high, very-high)
 */
export const getRiskLevel = (value) => {
  if (value == null || value <= 0) return 'low';
  if (value <= AQHI_LEVELS.LOW.max) return 'low';
  if (value <= AQHI_LEVELS.MODERATE.max) return 'moderate';
  if (value <= AQHI_LEVELS.HIGH.max) return 'high';
  return 'very-high';
};

/**
 * Get emoji for AQHI value
 * @param {number} value - AQHI value
 * @returns {string} Emoji representing air quality
 */
export const getAQHIEmoji = (value) => {
  if (value == null || value <= 0) return AQHI_LEVELS.LOW.emoji;
  if (value <= AQHI_LEVELS.LOW.max) return AQHI_LEVELS.LOW.emoji;
  if (value <= AQHI_LEVELS.MODERATE.max) return AQHI_LEVELS.MODERATE.emoji;
  if (value <= AQHI_LEVELS.HIGH.max) return AQHI_LEVELS.HIGH.emoji;
  return AQHI_LEVELS.VERY_HIGH.emoji;
};

/**
 * Get health message based on AQHI value
 * @param {number} value - AQHI value
 * @returns {string} Health advisory message
 */
export const getHealthMessage = (value) => {
  if (value == null || value <= 0) {
    return 'Air quality is good. Enjoy your usual outdoor activities.';
  }
  if (value <= AQHI_LEVELS.LOW.max) {
    return 'Air quality is good. Enjoy your usual outdoor activities.';
  }
  if (value <= AQHI_LEVELS.MODERATE.max) {
    return 'Consider reducing prolonged or heavy outdoor exertion if you experience symptoms.';
  }
  if (value <= AQHI_LEVELS.HIGH.max) {
    return 'Reduce prolonged or heavy outdoor exertion. Children and elderly should limit outdoor activities.';
  }
  return 'Avoid outdoor activities. Everyone should limit time outdoors, especially vulnerable groups.';
};

/**
 * Get AQHI data with all properties
 * @param {number} value - AQHI value
 * @returns {Object} Object containing color, label, risk level, emoji, and message
 */
export const getAQHIData = (value) => ({
  value: value || 0,
  color: getAQHIColor(value),
  label: getAQHILabel(value),
  riskLevel: getRiskLevel(value),
  emoji: getAQHIEmoji(value),
  message: getHealthMessage(value),
});

/**
 * Format AQHI value for display
 * @param {number} value - AQHI value
 * @returns {string} Formatted AQHI value
 */
export const formatAQHIValue = (value) => {
  if (value == null || value < 0) return '0';
  if (value > 10) return '10+';
  return Math.round(value).toString();
};

/**
 * Get color with opacity
 * @param {number} value - AQHI value
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} RGBA color string
 */
export const getAQHIColorWithOpacity = (value, opacity = 1) => {
  const color = getAQHIColor(value);
  // Convert hex to RGB
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Get legend items for AQHI scale
 * @returns {Array} Array of legend items
 */
export const getAQHILegend = () => [
  { range: '1-3', ...AQHI_LEVELS.LOW },
  { range: '4-6', ...AQHI_LEVELS.MODERATE },
  { range: '7-10', ...AQHI_LEVELS.HIGH },
  { range: '10+', ...AQHI_LEVELS.VERY_HIGH },
];

// Export all levels for direct access if needed
export const AQHI_THRESHOLDS = {
  LOW_MAX: AQHI_LEVELS.LOW.max,
  MODERATE_MAX: AQHI_LEVELS.MODERATE.max,
  HIGH_MAX: AQHI_LEVELS.HIGH.max,
};

export default {
  getAQHIColor,
  getAQHILabel,
  getRiskLevel,
  getAQHIEmoji,
  getHealthMessage,
  getAQHIData,
  formatAQHIValue,
  getAQHIColorWithOpacity,
  getAQHILegend,
  AQHI_THRESHOLDS,
};
