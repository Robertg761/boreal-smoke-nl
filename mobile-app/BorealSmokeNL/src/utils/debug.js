/**
 * Debug utilities for production-safe logging
 * Only logs in development mode
 */

const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';

/**
 * Production-safe console.log
 */
export const debugLog = (...args) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

/**
 * Production-safe console.warn
 */
export const debugWarn = (...args) => {
  if (isDevelopment) {
    console.warn(...args);
  }
};

/**
 * Production-safe console.error (always logs errors)
 */
export const debugError = (...args) => {
  // Always log errors, even in production
  console.error(...args);
};

/**
 * Performance timer for development
 */
export const debugTime = (label) => {
  if (isDevelopment) {
    console.time(label);
  }
};

export const debugTimeEnd = (label) => {
  if (isDevelopment) {
    console.timeEnd(label);
  }
};

export default {
  log: debugLog,
  warn: debugWarn,
  error: debugError,
  time: debugTime,
  timeEnd: debugTimeEnd,
};
