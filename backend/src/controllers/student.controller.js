const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Helper to generate a unique Family Code within a school
 */
async function generateUniqueFamilyCode(schoolId) {
  let unique = false;
  let code = '';
  while (!unique) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4 digits
    code = `FAM${randomDigits}`;
    const existing = await prisma.family.findFirst({
      where: { schoolId, familyCode: code },
    });
    if (!existing) {
      unique = true;
    }
  }
  return code;
}

/**
 * List Students with role scoping and filters
 * GET /api/students
 */
const getStudents = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const { class: studentClass, division, busId, search } = req.query;

    const where = { schoolId };

    // Role-based restrictions
    if (req.user.role === 'PARENT') {
      where.familyId = req.user.familyId;
    } else if (req.user.role === 'DRIVER') {
      // Driver sees only students on their assigned bus
      const driver = await prisma.driver.findFirst({
        where: { id: req.user.driverId, schoolId },
        include: { buses: true },
      });
      const driverBusIds = driver?.buses.map((b) => b.id) || [];
      where.busId = { in: driverBusIds };
    }

    if (studentClass) where.class = String(studentClass);
    if (division) where.division = String(division);
    if (busId) where.busId = String(busId);
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        bus: { select: { id: true, busNumber: true, registrationNumber: true } },
        pickupStop: { select: { id: true, name: true, sequence: true, estimatedArrival: true } },
        dropStop: { select: { id: true, name: true, sequence: true, estimatedArrival: true } },
        feePlan: { select: { id: true, name: true, amount: true, billingPeriod: true } },
        family: {
          select: {
            id: true,
            familyCode: true,
            parents: {
              select: { id: true, name: true, mobile: true, relationship: true, email: true },
            },
          },
        },
      },
      orderBy: [{ class: 'asc' }, { division: 'asc' }, { name: 'asc' }],
    });

    return successResponse(res, students, 'Students retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Student by ID
 * GET /api/students/:id
 */
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.targetSchoolId;

    const student = await prisma.student.findFirst({
      where: { id, schoolId },
      include: {
        bus: {
          include: {
            driver: { select: { id: true, name: true, mobile: true } },
            route: { select: { id: true, name: true } },
          },
        },
        pickupStop: true,
        dropStop: true,
        feePlan: true,
        family: {
          include: {
            parents: true,
          },
        },
        fees: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) {
      return errorResponse(res, 'Student not found', 404);
    }

    // Parent can only view their own children
    if (req.user.role === 'PARENT' && student.familyId !== req.user.familyId) {
      return errorResponse(res, 'Unauthorized to view this student', 403);
    }

    return successResponse(res, student, 'Student details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Create Student (School Admin or Teacher)
 * Implements Section 8: Teacher Add Student Flow
 * POST /api/students
 */
const createStudent = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const {
      // Student info
      name,
      studentId,
      class: studentClass,
      division,
      // Parent info
      parentName,
      relationship = 'GUARDIAN',
      parentMobile,
      parentEmail,
      familyCode: existingFamilyCode, // Optional: if joining existing family
      // Transport info
      busId,
      pickupStopId,
      dropStopId,
      feePlanId,
    } = req.body;

    if (!name || !studentId || !studentClass || !division) {
      return errorResponse(res, 'Student name, student ID, class, and division are required', 400);
    }

    if (!parentName || !parentMobile) {
      return errorResponse(res, 'Parent name and parent mobile number are required', 400);
    }

    // Check studentId uniqueness within school
    const existingStudent = await prisma.student.findFirst({
      where: { schoolId, studentId: studentId.trim() },
    });
    if (existingStudent) {
      return errorResponse(res, `Student with ID ${studentId} already exists in this school`, 409);
    }

    // Resolve or Create Family
    let family = null;
    let finalFamilyCode = '';

    if (existingFamilyCode) {
      family = await prisma.family.findFirst({
        where: { schoolId, familyCode: existingFamilyCode.trim().toUpperCase() },
      });
      if (!family) {
        return errorResponse(res, `Family Code ${existingFamilyCode} not found in this school`, 404);
      }
      finalFamilyCode = family.familyCode;
    } else {
      // Generate a new unique Family Code
      finalFamilyCode = await generateUniqueFamilyCode(schoolId);
      family = await prisma.family.create({
        data: {
          schoolId,
          familyCode: finalFamilyCode,
          status: 'ACTIVE',
        },
      });
    }

    // Create or Link Parent record
    let parent = await prisma.parent.findFirst({
      where: { schoolId, mobile: parentMobile.trim() },
    });

    if (!parent) {
      parent = await prisma.parent.create({
        data: {
          schoolId,
          familyId: family.id,
          name: parentName.trim(),
          relationship: relationship || 'GUARDIAN',
          mobile: parentMobile.trim(),
          email: parentEmail?.trim() || null,
          status: 'ACTIVE',
        },
      });
    } else if (parent.familyId !== family.id) {
      parent = await prisma.parent.update({
        where: { id: parent.id },
        data: {
          familyId: family.id,
          name: parentName.trim(),
          relationship: relationship || parent.relationship,
        },
      });
    }

    // Create Student
    const student = await prisma.student.create({
      data: {
        schoolId,
        studentId: studentId.trim(),
        name: name.trim(),
        class: String(studentClass).trim(),
        division: String(division).trim().toUpperCase(),
        familyId: family.id,
        busId: busId || null,
        pickupStopId: pickupStopId || null,
        dropStopId: dropStopId || null,
        feePlanId: feePlanId || null,
        status: 'ACTIVE',
      },
      include: {
        bus: true,
        pickupStop: true,
        dropStop: true,
        feePlan: true,
        family: {
          include: { parents: true },
        },
      },
    });

    // Auto-generate initial fee record if feePlanId is assigned
    if (feePlanId) {
      const plan = await prisma.feePlan.findFirst({
        where: { id: feePlanId, schoolId },
      });
      if (plan) {
        const currentDate = new Date();
        const currentMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        await prisma.studentFee.create({
          data: {
            schoolId,
            studentId: student.id,
            feePlanId: plan.id,
            familyId: family.id,
            billingPeriodLabel: currentMonthName,
            baseAmount: plan.amount,
            discount: 0,
            lateFee: 0,
            totalAmount: plan.amount,
            status: 'PENDING',
            dueDate: new Date(currentDate.setDate(plan.dueDay)),
          },
        }).catch((e) => console.error('Error generating initial fee:', e.message));
      }
    }

    return successResponse(res, {
      student,
      familyCode: finalFamilyCode,
      message: `Student enrolled successfully. Family Code: ${finalFamilyCode}`,
    }, 'Student created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Student
 * PUT /api/students/:id
 */
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.targetSchoolId;
    const {
      name,
      studentId,
      class: studentClass,
      division,
      busId,
      pickupStopId,
      dropStopId,
      feePlanId,
      status,
    } = req.body;

    const existing = await prisma.student.findFirst({
      where: { id, schoolId },
    });
    if (!existing) {
      return errorResponse(res, 'Student not found', 404);
    }

    const updated = await prisma.student.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(studentId && { studentId: studentId.trim() }),
        ...(studentClass && { class: String(studentClass).trim() }),
        ...(division && { division: String(division).trim().toUpperCase() }),
        ...(busId !== undefined && { busId: busId || null }),
        ...(pickupStopId !== undefined && { pickupStopId: pickupStopId || null }),
        ...(dropStopId !== undefined && { dropStopId: dropStopId || null }),
        ...(feePlanId !== undefined && { feePlanId: feePlanId || null }),
        ...(status && { status }),
      },
      include: {
        bus: true,
        pickupStop: true,
        dropStop: true,
        feePlan: true,
      },
    });

    return successResponse(res, updated, 'Student updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Student
 * DELETE /api/students/:id
 */
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.targetSchoolId;

    const existing = await prisma.student.findFirst({
      where: { id, schoolId },
    });
    if (!existing) {
      return errorResponse(res, 'Student not found', 404);
    }

    await prisma.student.delete({
      where: { id },
    });

    return successResponse(res, null, 'Student removed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
