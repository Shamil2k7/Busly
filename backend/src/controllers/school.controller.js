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

const bcrypt = require('bcryptjs');

/**
 * Update School Details (SUPER_ADMIN or SCHOOL_ADMIN)
 */
const updateSchool = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, address, phone, email, logo, status, subscriptionPlan } = req.body;

    if (req.user.role !== 'SUPER_ADMIN' && req.user.schoolId !== id) {
      return errorResponse(res, 'Unauthorized to update this school', 403);
    }

    const existingSchool = await prisma.school.findUnique({
      where: { id },
    });

    if (!existingSchool) {
      return errorResponse(res, 'School not found', 404);
    }

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (address !== undefined) dataToUpdate.address = address?.trim() || null;
    if (phone !== undefined) dataToUpdate.phone = phone?.trim() || null;
    if (email !== undefined) dataToUpdate.email = email?.trim() || null;
    if (logo !== undefined) dataToUpdate.logo = logo?.trim() || null;

    // Only SUPER_ADMIN can modify school code, status, and subscription plan
    if (req.user.role === 'SUPER_ADMIN') {
      if (status !== undefined) dataToUpdate.status = status;
      if (subscriptionPlan !== undefined) dataToUpdate.subscriptionPlan = subscriptionPlan;

      if (code && code.trim().toUpperCase() !== existingSchool.code) {
        const normalizedCode = code.trim().toUpperCase();
        const codeExists = await prisma.school.findUnique({
          where: { code: normalizedCode },
        });
        if (codeExists && codeExists.id !== id) {
          return errorResponse(res, `School code ${normalizedCode} is already taken by another school`, 409);
        }
        dataToUpdate.code = normalizedCode;
      }
    }

    const updated = await prisma.school.update({
      where: { id },
      data: dataToUpdate,
    });

    return successResponse(res, updated, 'School details updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get School Administrators (SUPER_ADMIN)
 */
const getSchoolAdmins = async (req, res, next) => {
  try {
    const { id } = req.params;

    const school = await prisma.school.findUnique({
      where: { id },
    });

    if (!school) {
      return errorResponse(res, 'School not found', 404);
    }

    const admins = await prisma.user.findMany({
      where: {
        schoolId: id,
        role: 'SCHOOL_ADMIN',
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, admins, 'School administrators retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Add a New School Admin to a School (SUPER_ADMIN)
 */
const createSchoolAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, password, mobile } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email, and password are required', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters long', 400);
    }

    const school = await prisma.school.findUnique({
      where: { id },
    });

    if (!school) {
      return errorResponse(res, 'School not found', 404);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return errorResponse(res, 'A user with this email address already exists in the system', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        mobile: mobile?.trim() || null,
        role: 'SCHOOL_ADMIN',
        schoolId: id,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
        schoolId: true,
        createdAt: true,
      },
    });

    return successResponse(res, admin, 'School Administrator created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle School Admin Active/Inactive Status (SUPER_ADMIN)
 */
const toggleSchoolAdminStatus = async (req, res, next) => {
  try {
    const { id, adminId } = req.params;
    const { status } = req.body;

    const admin = await prisma.user.findFirst({
      where: {
        id: adminId,
        schoolId: id,
        role: 'SCHOOL_ADMIN',
      },
    });

    if (!admin) {
      return errorResponse(res, 'School Administrator not found', 404);
    }

    const newStatus = status || (admin.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');

    const updated = await prisma.user.update({
      where: { id: adminId },
      data: { status: newStatus },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
      },
    });

    return successResponse(res, updated, `School Admin status set to ${newStatus}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSchools,
  getSchoolById,
  createSchool,
  updateSchool,
  getSchoolAdmins,
  createSchoolAdmin,
  toggleSchoolAdminStatus,
};
