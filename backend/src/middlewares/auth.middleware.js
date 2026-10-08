const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');
const prisma = require('../config/db');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. No token provided.', 401);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return errorResponse(res, 'Invalid or expired token.', 401);
    }

    // Handle PARENT role (who doesn't have a direct User record, but is anchored to a Family)
    if (decoded.role === 'PARENT') {
      const parent = await prisma.parent.findFirst({
        where: {
          id: decoded.parentId,
          familyId: decoded.familyId,
          schoolId: decoded.schoolId,
          status: 'ACTIVE',
        },
        include: {
          family: true,
          school: true,
        },
      });

      if (!parent) {
        return errorResponse(res, 'Parent profile not found or inactive.', 401);
      }

      req.user = {
        id: parent.id,
        role: 'PARENT',
        schoolId: parent.schoolId,
        familyId: parent.familyId,
        parentId: parent.id,
        name: parent.name,
        mobile: parent.mobile,
        familyCode: parent.family.familyCode,
        schoolName: parent.school.name,
        schoolCode: parent.school.code,
      };
      req.schoolId = parent.schoolId;
      return next();
    }

    // For other roles (SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, DRIVER)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        school: true,
        teacher: true,
        driver: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      return errorResponse(res, 'User account is inactive or not found.', 401);
    }

    req.user = {
      id: user.id,
      role: user.role,
      schoolId: user.schoolId,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      teacherId: user.teacher?.id || null,
      driverId: user.driver?.id || null,
      schoolName: user.school?.name || null,
      schoolCode: user.school?.code || null,
    };
    req.schoolId = user.schoolId;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return errorResponse(res, 'Authentication failed.', 500);
  }
};

module.exports = {
  authenticate,
};
