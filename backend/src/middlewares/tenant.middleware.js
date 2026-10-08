const { errorResponse } = require('../utils/response');

/**
 * Tenant Isolation Middleware
 * Enforces that non-Super-Admin users can only access resources belonging to their own school.
 */
const enforceTenant = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required.', 401);
  }

  // Super Admin can access all schools or specify a target school via headers/params
  if (req.user.role === 'SUPER_ADMIN') {
    req.targetSchoolId = req.headers['x-school-id'] || req.query.schoolId || null;
    return next();
  }

  // All other roles MUST have a valid schoolId
  if (!req.user.schoolId) {
    return errorResponse(res, 'User is not associated with any active school.', 403);
  }

  // If a schoolId parameter is supplied in route or body or query, verify it matches
  const requestedSchoolId = req.params.schoolId || req.body.schoolId || req.query.schoolId;

  if (requestedSchoolId && requestedSchoolId !== req.user.schoolId) {
    return errorResponse(res, 'Tenant violation: You cannot access or modify another school\'s resources.', 403);
  }

  // Fix targetSchoolId to user's authorized schoolId
  req.targetSchoolId = req.user.schoolId;
  next();
};

module.exports = {
  enforceTenant,
};
