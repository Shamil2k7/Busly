const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getTeachers = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const teachers = await prisma.teacher.findMany({
      where: { schoolId },
      include: {
        user: { select: { id: true, email: true, status: true } },
      },
      orderBy: { name: 'asc' },
    });
    return successResponse(res, teachers, 'Teachers retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getTeacherById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.targetSchoolId;

    const teacher = await prisma.teacher.findFirst({
      where: { id, schoolId },
      include: {
        user: true,
      },
    });

    if (!teacher) {
      return errorResponse(res, 'Teacher not found', 404);
    }

    return successResponse(res, teacher, 'Teacher details retrieved');
  } catch (error) {
    next(error);
  }
};

const createTeacher = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const { name, mobile, email, employeeId, assignedClasses } = req.body;

    if (!name || !mobile || !employeeId) {
      return errorResponse(res, 'Teacher name, mobile number, and Employee ID are required', 400);
    }

    const existingEmp = await prisma.teacher.findFirst({
      where: { schoolId, employeeId: employeeId.trim() },
    });
    if (existingEmp) {
      return errorResponse(res, `Employee ID ${employeeId} is already in use`, 409);
    }

    const existingMobile = await prisma.teacher.findFirst({
      where: { schoolId, mobile: mobile.trim() },
    });
    if (existingMobile) {
      return errorResponse(res, `Mobile number ${mobile} is already registered to a teacher`, 409);
    }

    // Create user record for teacher
    const user = await prisma.user.create({
      data: {
        schoolId,
        name: name.trim(),
        email: email?.trim() || null,
        mobile: mobile.trim(),
        role: 'TEACHER',
        status: 'ACTIVE',
      },
    });

    const teacher = await prisma.teacher.create({
      data: {
        schoolId,
        userId: user.id,
        name: name.trim(),
        mobile: mobile.trim(),
        email: email?.trim() || null,
        employeeId: employeeId.trim(),
        assignedClasses: assignedClasses?.trim() || null,
        status: 'ACTIVE',
      },
    });

    return successResponse(res, teacher, 'Teacher registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.targetSchoolId;
    const { name, mobile, email, assignedClasses, status } = req.body;

    const teacher = await prisma.teacher.findFirst({
      where: { id, schoolId },
    });
    if (!teacher) {
      return errorResponse(res, 'Teacher not found', 404);
    }

    const updated = await prisma.teacher.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(mobile && { mobile: mobile.trim() }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(assignedClasses !== undefined && { assignedClasses: assignedClasses?.trim() || null }),
        ...(status && { status }),
      },
    });

    if (teacher.userId) {
      await prisma.user.update({
        where: { id: teacher.userId },
        data: {
          ...(name && { name: name.trim() }),
          ...(mobile && { mobile: mobile.trim() }),
          ...(status && { status }),
        },
      });
    }

    return successResponse(res, updated, 'Teacher updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.targetSchoolId;

    const teacher = await prisma.teacher.findFirst({
      where: { id, schoolId },
    });
    if (!teacher) {
      return errorResponse(res, 'Teacher not found', 404);
    }

    await prisma.teacher.delete({ where: { id } });
    if (teacher.userId) {
      await prisma.user.delete({ where: { id: teacher.userId } }).catch(() => {});
    }

    return successResponse(res, null, 'Teacher deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
};
