const { errorResponse } = require('../utils/response');

/**
 * Require one of the specified roles
 * @param {string[]} allowedRoles
 */
const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Required role: [${allowedRoles.join(', ')}]. Your role: ${req.user.role}`,
        403
      );
    }

    next();
  };
};

module.exports = {
  requireRole,
};
