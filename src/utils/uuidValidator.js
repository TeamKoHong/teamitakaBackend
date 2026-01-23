/**
 * UUID Validation Utility
 * Validates UUID v4 format strings
 */

// UUID v4 regex pattern (supports versions 1-5, variant 1)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Check if a string is a valid UUID
 * @param {string} str - The string to validate
 * @returns {boolean} - True if valid UUID, false otherwise
 */
const isValidUUID = (str) => {
  if (typeof str !== 'string') return false;
  return UUID_REGEX.test(str);
};

module.exports = { isValidUUID, UUID_REGEX };
