/**
 * UUID Validation Middleware
 * Validates route parameters that should be UUIDs
 */

const { isValidUUID } = require('../utils/uuidValidator');

/**
 * Middleware factory to validate UUID parameters in route
 * @param {...string} paramNames - Names of route parameters to validate as UUIDs
 * @returns {Function} Express middleware function
 *
 * @example
 * // Single parameter
 * router.get("/:project_id", validateUUID('project_id'), controller.getProject);
 *
 * // Multiple parameters
 * router.get("/:project_id/todo/:todo_id", validateUUID('project_id', 'todo_id'), controller.getTodo);
 */
const validateUUID = (...paramNames) => {
  return (req, res, next) => {
    for (const paramName of paramNames) {
      const value = req.params[paramName];

      // Only validate if the parameter exists in the request
      if (value && !isValidUUID(value)) {
        return res.status(400).json({
          error: `Invalid ${paramName} format. Expected UUID.`,
          received: value
        });
      }
    }
    next();
  };
};

module.exports = { validateUUID };
