const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * List all schools (SUPER_ADMIN) or current school (SCHOOL_ADMIN)
 */
const getSchools = async (req, res, next) => {
  try {
    if (req.user.role === 'SUPER_ADMIN') {
      const schools = await prisma.school.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              students: true,
              teachers: true,
              drivers: true,
              buses: true,
            },
          },
        },
      });
      return successResponse(res, schools, 'Schools list retrieved');
    }

    // For School Admin, return only their own school
    const school = await prisma.school.findUnique({
      where: { id: req.user.schoolId },
      include: {
        _count: {
          select: {
            students: true,
            teachers: true,
            drivers: true,
            buses: true,
          },
        },
      },
    });
    return successResponse(res, [school], 'School retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get school by ID
 */
const getSchoolById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'SUPER_ADMIN' && req.user.schoolId !== id) {
      return errorResponse(res, 'Unauthorized to view this school', 403);
    }

    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, name: true, email: true, role: true, status: true } },
        _count: {
          select: {
            students: true,
            teachers: true,
            drivers: true,
            buses: true,
            routes: true,
          },
        },
      },
    });

    if (!school) {
      return errorResponse(res, 'School not found', 404);
    }

    return successResponse(res, school, 'School details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Create School (SUPER_ADMIN)
 */
const createSchool = async (req, res, next) => {
  try {
    const { name, code, address, phone, email, subscriptionPlan } = req.body;

    if (!name || !code) {
      return errorResponse(res, 'School name and unique code are required', 400);
    }

    const existing = await prisma.school.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (existing) {
      return errorResponse(res, `School with code ${code} already exists`, 409);
    }

    const school = await prisma.school.create({
      data: {
        name,
        code: code.trim().toUpperCase(),
        address,
        phone,
        email,
        subscriptionPlan: subscriptionPlan || 'BASIC',
      },
    });

    return successResponse(res, school, 'School created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update School
 */
const updateSchool = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, address, phone, email, logo, status, subscriptionPlan } = req.body;

    if (req.user.role !== 'SUPER_ADMIN' && req.user.schoolId !== id) {
      return errorResponse(res, 'Unauthorized to update this school', 403);
    }

    const dataToUpdate = {
      name,
      address,
      phone,
      email,
      logo,
    };

    // Only SUPER_ADMIN can modify status and subscription plan
    if (req.user.role === 'SUPER_ADMIN') {
      if (status) dataToUpdate.status = status;
      if (subscriptionPlan) dataToUpdate.subscriptionPlan = subscriptionPlan;
    }

    const updated = await prisma.school.update({
      where: { id },
      data: dataToUpdate,
    });

    return successResponse(res, updated, 'School updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSchools,
  getSchoolById,
  createSchool,
  updateSchool,
};
