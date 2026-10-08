const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * List Fee Plans
 * GET /api/fees/plans
 */
const getFeePlans = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const plans = await prisma.feePlan.findMany({
      where: { schoolId },
      include: {
        _count: { select: { students: true, studentFees: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, plans, 'Fee plans retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Create Fee Plan (School Admin)
 * POST /api/fees/plans
 */
const createFeePlan = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const { name, amount, billingPeriod = 'MONTHLY', dueDay = 10, lateFee = 50 } = req.body;

    if (!name || amount === undefined) {
      return errorResponse(res, 'Plan name and amount are required', 400);
    }

    const plan = await prisma.feePlan.create({
      data: {
        schoolId,
        name: name.trim(),
        amount: parseFloat(amount),
        billingPeriod,
        dueDay: parseInt(dueDay, 10),
        lateFee: parseFloat(lateFee || 0),
        status: 'ACTIVE',
      },
    });

    return successResponse(res, plan, 'Fee plan created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * List Student Fees (Parent sees only their children, Admin sees all)
 * GET /api/fees/students
 */
const getStudentFees = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const { status, studentId, search } = req.query;

    const where = { schoolId };

    if (req.user.role === 'PARENT') {
      where.familyId = req.user.familyId;
    }

    if (status) where.status = status;
    if (studentId) where.studentId = studentId;

    const fees = await prisma.studentFee.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            class: true,
            division: true,
            bus: { select: { busNumber: true } },
          },
        },
        feePlan: true,
        payments: {
          orderBy: { paidAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, fees, 'Student fee records retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Generate / Assign Fee to Students (School Admin)
 * POST /api/fees/assign
 */
const assignFees = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const { feePlanId, billingPeriodLabel, targetType = 'ALL', studentIds = [] } = req.body;

    if (!feePlanId || !billingPeriodLabel) {
      return errorResponse(res, 'Fee Plan and Billing Period Label are required', 400);
    }

    const plan = await prisma.feePlan.findFirst({
      where: { id: feePlanId, schoolId },
    });

    if (!plan) {
      return errorResponse(res, 'Fee Plan not found', 404);
    }

    let targetStudents = [];
    if (targetType === 'SELECTED' && studentIds.length > 0) {
      targetStudents = await prisma.student.findMany({
        where: { id: { in: studentIds }, schoolId, status: 'ACTIVE' },
      });
    } else {
      targetStudents = await prisma.student.findMany({
        where: { schoolId, status: 'ACTIVE', busId: { not: null } },
      });
    }

    let createdCount = 0;
    const dueDate = new Date();
    dueDate.setDate(plan.dueDay);

    for (const st of targetStudents) {
      // Check if already assigned for this billing cycle
      const existing = await prisma.studentFee.findFirst({
        where: {
          studentId: st.id,
          billingPeriodLabel: billingPeriodLabel.trim(),
        },
      });

      if (!existing) {
        await prisma.studentFee.create({
          data: {
            schoolId,
            studentId: st.id,
            feePlanId: plan.id,
            familyId: st.familyId,
            billingPeriodLabel: billingPeriodLabel.trim(),
            baseAmount: plan.amount,
            discount: 0,
            lateFee: 0,
            totalAmount: plan.amount,
            status: 'PENDING',
            dueDate,
          },
        });
        createdCount++;
      }
    }

    return successResponse(
      res,
      { assignedCount: createdCount },
      `Fee billing generated for ${createdCount} student(s)`
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFeePlans,
  createFeePlan,
  getStudentFees,
  assignFees,
};
