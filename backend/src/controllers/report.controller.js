const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * School Admin Dashboard Metrics
 * GET /api/reports/dashboard/admin
 */
const getAdminDashboard = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;

    const [
      totalStudents,
      activeBuses,
      activeDrivers,
      todayTrips,
      feeStats,
      activeAlerts,
    ] = await Promise.all([
      prisma.student.count({ where: { schoolId, status: 'ACTIVE' } }),
      prisma.bus.count({ where: { schoolId, status: 'ACTIVE' } }),
      prisma.driver.count({ where: { schoolId, status: 'ACTIVE' } }),
      prisma.trip.findMany({
        where: {
          schoolId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        include: {
          bus: true,
          driver: true,
          route: true,
        },
        orderBy: { scheduledStart: 'asc' },
      }),
      prisma.studentFee.aggregate({
        where: { schoolId },
        _sum: { totalAmount: true },
      }),
      prisma.emergencyAlert.findMany({
        where: { schoolId, status: 'ACTIVE' },
        include: { bus: true, driver: true },
      }),
    ]);

    const collectedFees = await prisma.payment.aggregate({
      where: { schoolId, status: 'SUCCESS' },
      _sum: { amount: true },
    });

    const pendingFeesCount = await prisma.studentFee.count({
      where: { schoolId, status: 'PENDING' },
    });

    // Recent buses with their latest coordinates for the live map
    const liveBuses = await prisma.bus.findMany({
      where: { schoolId, status: 'ACTIVE' },
      include: {
        driver: { select: { name: true, mobile: true } },
        route: { select: { name: true } },
        locationLogs: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    return successResponse(res, {
      metrics: {
        totalStudents,
        activeBuses,
        activeDrivers,
        todayTripsCount: todayTrips.length,
        totalFeesBilled: feeStats._sum.totalAmount || 0,
        collectedFees: collectedFees._sum.amount || 0,
        pendingFeesCount,
        activeSosAlerts: activeAlerts.length,
      },
      todayTrips,
      liveBuses,
      activeAlerts,
    }, 'Admin dashboard metrics retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Teacher Dashboard Metrics
 * GET /api/reports/dashboard/teacher
 */
const getTeacherDashboard = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const teacher = await prisma.teacher.findFirst({
      where: { schoolId, id: req.user.teacherId },
    });

    // Filter students by assigned classes if defined
    let assignedClassesList = [];
    if (teacher?.assignedClasses) {
      assignedClassesList = teacher.assignedClasses.split(',').map((c) => c.trim());
    }

    const students = await prisma.student.findMany({
      where: {
        schoolId,
        status: 'ACTIVE',
        ...(assignedClassesList.length > 0 ? { class: { in: assignedClassesList.map((c) => c.split('-')[0]) } } : {}),
      },
      include: {
        bus: true,
        pickupStop: true,
        dropStop: true,
      },
    });

    const activeBuses = await prisma.bus.findMany({
      where: { schoolId, status: 'ACTIVE' },
      include: {
        driver: true,
        route: true,
        locationLogs: { take: 1, orderBy: { timestamp: 'desc' } },
      },
    });

    const todayTrips = await prisma.trip.findMany({
      where: {
        schoolId,
        status: { in: ['ACTIVE', 'SCHEDULED'] },
      },
      include: { bus: true, driver: true, route: true },
    });

    return successResponse(res, {
      totalMyStudents: students.length,
      students: students.slice(0, 10),
      activeBuses,
      todayTrips,
    }, 'Teacher dashboard data retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Driver Dashboard Metrics
 * GET /api/reports/dashboard/driver
 */
const getDriverDashboard = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const driverId = req.user.driverId;

    const bus = await prisma.bus.findFirst({
      where: { schoolId, driverId },
      include: {
        route: {
          include: { stops: { orderBy: { sequence: 'asc' } } },
        },
      },
    });

    const activeTrip = await prisma.trip.findFirst({
      where: {
        schoolId,
        driverId,
        status: { in: ['ACTIVE', 'SCHEDULED'] },
      },
      orderBy: { scheduledStart: 'desc' },
      include: {
        bus: true,
        route: { include: { stops: { orderBy: { sequence: 'asc' } } } },
        studentStatuses: {
          include: {
            student: {
              include: { pickupStop: true, dropStop: true },
            },
          },
        },
      },
    });

    return successResponse(res, {
      bus,
      activeTrip,
      hasActiveTrip: !!activeTrip && activeTrip.status === 'ACTIVE',
    }, 'Driver dashboard retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Parent Dashboard Metrics
 * GET /api/reports/dashboard/parent
 */
const getParentDashboard = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const familyId = req.user.familyId;

    const family = await prisma.family.findFirst({
      where: { id: familyId, schoolId },
      include: {
        students: {
          where: { status: 'ACTIVE' },
          include: {
            bus: {
              include: {
                driver: true,
                route: {
                  include: { stops: { orderBy: { sequence: 'asc' } } },
                },
                locationLogs: {
                  take: 1,
                  orderBy: { timestamp: 'desc' },
                },
              },
            },
            pickupStop: true,
            dropStop: true,
            tripStatuses: {
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
            fees: {
              where: { status: 'PENDING' },
              include: { feePlan: true },
            },
          },
        },
      },
    });

    const recentNotifications = await prisma.notification.findMany({
      where: {
        schoolId,
        OR: [
          { familyId },
          { recipientRole: 'PARENT' },
          { recipientRole: 'ALL' },
        ],
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, {
      familyCode: family?.familyCode,
      children: family?.students || [],
      recentNotifications,
    }, 'Parent dashboard retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Super Admin SaaS Platform Metrics
 * GET /api/reports/super-admin
 */
const getSuperAdminMetrics = async (req, res, next) => {
  try {
    const [
      totalSchools,
      activeSchools,
      totalStudents,
      totalBuses,
      totalUsers,
      recentPayments,
    ] = await Promise.all([
      prisma.school.count(),
      prisma.school.count({ where: { status: 'ACTIVE' } }),
      prisma.student.count(),
      prisma.bus.count(),
      prisma.user.count(),
      prisma.payment.findMany({
        take: 10,
        orderBy: { paidAt: 'desc' },
        include: { school: { select: { name: true, code: true } } },
      }),
    ]);

    const platformRevenue = await prisma.payment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
    });

    return successResponse(res, {
      totalSchools,
      activeSchools,
      totalStudents,
      totalBuses,
      totalUsers,
      totalRevenue: platformRevenue._sum.amount || 0,
      recentPayments,
    }, 'Platform metrics retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getTeacherDashboard,
  getDriverDashboard,
  getParentDashboard,
  getSuperAdminMetrics,
};
