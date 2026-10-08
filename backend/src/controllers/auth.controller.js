const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { generateToken } = require('../utils/jwt');
const { createOtpSession, verifyOtpSession } = require('../utils/otp');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Admin Login (SUPER_ADMIN and SCHOOL_ADMIN)
 * POST /api/auth/login
 */
const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { school: true },
    });

    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    if (!['SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(user.role)) {
      return errorResponse(res, 'This portal is restricted to administrators', 403);
    }

    if (user.status !== 'ACTIVE') {
      return errorResponse(res, 'Your account is deactivated. Contact support.', 403);
    }

    if (user.schoolId && user.school && user.school.status !== 'ACTIVE') {
      return errorResponse(res, 'School account is suspended. Contact Busly Super Admin.', 403);
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash || '');
    if (!isValidPassword) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const tokenPayload = {
      id: user.id,
      role: user.role,
      schoolId: user.schoolId,
    };

    const token = generateToken(tokenPayload);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        schoolName: user.school?.name,
        schoolCode: user.school?.code,
      },
    }, 'Admin login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Request OTP for Teacher, Driver, or Parent
 * POST /api/auth/otp/request
 */
const requestOtp = async (req, res, next) => {
  try {
    const { role, schoolCode, mobile, familyCode } = req.body;

    if (!role || !schoolCode || !mobile) {
      return errorResponse(res, 'Role, School Code, and Mobile Number are required', 400);
    }

    const formattedMobile = mobile.trim();
    const formattedSchoolCode = schoolCode.trim().toUpperCase();

    // 1. Verify School exists and is active
    const school = await prisma.school.findUnique({
      where: { code: formattedSchoolCode },
    });

    if (!school || school.status !== 'ACTIVE') {
      return errorResponse(res, 'Invalid or inactive School Code', 404);
    }

    let targetEntity = null;

    // 2. Validate role-specific registration
    if (role === 'TEACHER') {
      targetEntity = await prisma.teacher.findFirst({
        where: {
          schoolId: school.id,
          mobile: formattedMobile,
          status: 'ACTIVE',
        },
      });

      if (!targetEntity) {
        return errorResponse(res, 'Mobile number not registered as an active teacher in this school', 404);
      }
    } else if (role === 'DRIVER') {
      targetEntity = await prisma.driver.findFirst({
        where: {
          schoolId: school.id,
          mobile: formattedMobile,
          status: 'ACTIVE',
        },
      });

      if (!targetEntity) {
        return errorResponse(res, 'Mobile number not registered as an active driver in this school', 404);
      }
    } else if (role === 'PARENT') {
      if (!familyCode) {
        return errorResponse(res, 'Family Code is required for parent login', 400);
      }

      const formattedFamilyCode = familyCode.trim().toUpperCase();
      const family = await prisma.family.findFirst({
        where: {
          schoolId: school.id,
          familyCode: formattedFamilyCode,
          status: 'ACTIVE',
        },
      });

      if (!family) {
        return errorResponse(res, 'Family Code not found in this school', 404);
      }

      targetEntity = await prisma.parent.findFirst({
        where: {
          schoolId: school.id,
          familyId: family.id,
          mobile: formattedMobile,
          status: 'ACTIVE',
        },
      });

      if (!targetEntity) {
        return errorResponse(res, 'Mobile number not registered under this family code', 404);
      }

      // Store familyId in session creation
      const otpData = await createOtpSession({
        mobile: formattedMobile,
        role: 'PARENT',
        schoolId: school.id,
        familyId: family.id,
      });

      return successResponse(res, {
        sessionId: otpData.sessionId,
        expiresAt: otpData.expiresAt,
        mobile: formattedMobile,
        schoolName: school.name,
        // For development/testing convenience:
        devOtp: process.env.NODE_ENV !== 'production' ? otpData.otp : undefined,
      }, 'OTP sent successfully to registered mobile number');
    } else {
      return errorResponse(res, 'Invalid role specified for OTP login', 400);
    }

    // For Teacher or Driver:
    const otpData = await createOtpSession({
      mobile: formattedMobile,
      role,
      schoolId: school.id,
    });

    return successResponse(res, {
      sessionId: otpData.sessionId,
      expiresAt: otpData.expiresAt,
      mobile: formattedMobile,
      schoolName: school.name,
      // For development/testing convenience:
      devOtp: process.env.NODE_ENV !== 'production' ? otpData.otp : undefined,
    }, 'OTP sent successfully to registered mobile number');
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP and complete login
 * POST /api/auth/otp/verify
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { sessionId, mobile, role, otp } = req.body;

    if (!sessionId || !mobile || !role || !otp) {
      return errorResponse(res, 'Session ID, Mobile, Role, and OTP are required', 400);
    }

    const verification = await verifyOtpSession({
      sessionId,
      mobile: mobile.trim(),
      role,
      otp: otp.trim(),
    });

    if (!verification.success) {
      return errorResponse(res, verification.message, 400);
    }

    const session = verification.session;

    // Handle PARENT login
    if (role === 'PARENT') {
      const parent = await prisma.parent.findFirst({
        where: {
          familyId: session.familyId,
          schoolId: session.schoolId,
          mobile: session.mobile,
          status: 'ACTIVE',
        },
        include: {
          family: {
            include: {
              students: {
                where: { status: 'ACTIVE' },
                include: {
                  bus: true,
                  pickupStop: true,
                  dropStop: true,
                },
              },
            },
          },
          school: true,
        },
      });

      if (!parent) {
        return errorResponse(res, 'Parent profile not found', 404);
      }

      const token = generateToken({
        parentId: parent.id,
        familyId: parent.familyId,
        schoolId: parent.schoolId,
        role: 'PARENT',
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return successResponse(res, {
        token,
        user: {
          id: parent.id,
          parentId: parent.id,
          name: parent.name,
          mobile: parent.mobile,
          role: 'PARENT',
          schoolId: parent.schoolId,
          schoolName: parent.school.name,
          schoolCode: parent.school.code,
          familyId: parent.familyId,
          familyCode: parent.family.familyCode,
          children: parent.family.students,
        },
      }, 'Parent login successful');
    }

    // Handle TEACHER login
    if (role === 'TEACHER') {
      const teacher = await prisma.teacher.findFirst({
        where: {
          schoolId: session.schoolId,
          mobile: session.mobile,
          status: 'ACTIVE',
        },
        include: {
          school: true,
          user: true,
        },
      });

      if (!teacher) {
        return errorResponse(res, 'Teacher profile not found', 404);
      }

      let userId = teacher.userId;
      if (!userId) {
        // Create user record if not already linked
        const newUser = await prisma.user.create({
          data: {
            schoolId: teacher.schoolId,
            name: teacher.name,
            mobile: teacher.mobile,
            role: 'TEACHER',
            status: 'ACTIVE',
          },
        });
        userId = newUser.id;
        await prisma.teacher.update({
          where: { id: teacher.id },
          data: { userId },
        });
      }

      const token = generateToken({
        id: userId,
        teacherId: teacher.id,
        schoolId: teacher.schoolId,
        role: 'TEACHER',
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return successResponse(res, {
        token,
        user: {
          id: userId,
          teacherId: teacher.id,
          name: teacher.name,
          mobile: teacher.mobile,
          role: 'TEACHER',
          schoolId: teacher.schoolId,
          schoolName: teacher.school.name,
          schoolCode: teacher.school.code,
          employeeId: teacher.employeeId,
          assignedClasses: teacher.assignedClasses,
        },
      }, 'Teacher login successful');
    }

    // Handle DRIVER login
    if (role === 'DRIVER') {
      const driver = await prisma.driver.findFirst({
        where: {
          schoolId: session.schoolId,
          mobile: session.mobile,
          status: 'ACTIVE',
        },
        include: {
          school: true,
          buses: true,
        },
      });

      if (!driver) {
        return errorResponse(res, 'Driver profile not found', 404);
      }

      let userId = driver.userId;
      if (!userId) {
        const newUser = await prisma.user.create({
          data: {
            schoolId: driver.schoolId,
            name: driver.name,
            mobile: driver.mobile,
            role: 'DRIVER',
            status: 'ACTIVE',
          },
        });
        userId = newUser.id;
        await prisma.driver.update({
          where: { id: driver.id },
          data: { userId },
        });
      }

      const token = generateToken({
        id: userId,
        driverId: driver.id,
        schoolId: driver.schoolId,
        role: 'DRIVER',
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return successResponse(res, {
        token,
        user: {
          id: userId,
          driverId: driver.id,
          name: driver.name,
          mobile: driver.mobile,
          role: 'DRIVER',
          schoolId: driver.schoolId,
          schoolName: driver.school.name,
          schoolCode: driver.school.code,
          assignedBus: driver.buses[0] || null,
        },
      }, 'Driver login successful');
    }

    return errorResponse(res, 'Unhandled role', 400);
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user session
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    return successResponse(res, { user: req.user }, 'Authenticated user context');
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    res.clearCookie('token');
    return successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginAdmin,
  requestOtp,
  verifyOtp,
  getMe,
  logout,
};
