const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * List Trips with filters
 * GET /api/trips
 */
const getTrips = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const { busId, driverId, status, date } = req.query;

    const where = { schoolId };
    if (busId) where.busId = busId;
    if (driverId) where.driverId = driverId;
    if (status) where.status = status;

    if (req.user.role === 'DRIVER') {
      where.driverId = req.user.driverId;
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        bus: { select: { id: true, busNumber: true, registrationNumber: true } },
        driver: { select: { id: true, name: true, mobile: true } },
        route: { select: { id: true, name: true } },
        studentStatuses: {
          select: { id: true, status: true, studentId: true },
        },
      },
      orderBy: { scheduledStart: 'desc' },
      take: 50,
    });

    return successResponse(res, trips, 'Trips retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Trip by ID
 * GET /api/trips/:id
 */
const getTripById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.targetSchoolId;

    const trip = await prisma.trip.findFirst({
      where: { id, schoolId },
      include: {
        bus: true,
        driver: true,
        route: {
          include: {
            stops: { orderBy: { sequence: 'asc' } },
          },
        },
        studentStatuses: {
          include: {
            student: {
              include: {
                pickupStop: true,
                dropStop: true,
                family: {
                  include: { parents: true },
                },
              },
            },
          },
        },
        locationLogs: {
          take: 5,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!trip) {
      return errorResponse(res, 'Trip not found', 404);
    }

    // Role filtering for parent: only see their children's statuses
    if (req.user.role === 'PARENT') {
      trip.studentStatuses = trip.studentStatuses.filter(
        (s) => s.student.familyId === req.user.familyId
      );
    }

    return successResponse(res, trip, 'Trip details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new Scheduled Trip (School Admin)
 * POST /api/trips
 */
const createTrip = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const { busId, driverId, routeId, type = 'MORNING', scheduledStart } = req.body;

    if (!busId || !routeId) {
      return errorResponse(res, 'Bus ID and Route ID are required', 400);
    }

    // If driverId not specified, lookup from bus
    let finalDriverId = driverId;
    if (!finalDriverId) {
      const bus = await prisma.bus.findUnique({ where: { id: busId } });
      finalDriverId = bus?.driverId;
    }

    if (!finalDriverId) {
      return errorResponse(res, 'A driver must be assigned to this bus or trip', 400);
    }

    const trip = await prisma.trip.create({
      data: {
        schoolId,
        busId,
        driverId: finalDriverId,
        routeId,
        type,
        scheduledStart: scheduledStart ? new Date(scheduledStart) : new Date(),
        status: 'SCHEDULED',
      },
      include: {
        bus: true,
        driver: true,
        route: true,
      },
    });

    // Populate initial StudentTripStatuses for all students assigned to this bus
    const assignedStudents = await prisma.student.findMany({
      where: { schoolId, busId, status: 'ACTIVE' },
    });

    if (assignedStudents.length > 0) {
      await prisma.studentTripStatus.createMany({
        data: assignedStudents.map((st) => ({
          tripId: trip.id,
          studentId: st.id,
          status: 'WAITING',
          stopId: type === 'MORNING' ? st.pickupStopId : st.dropStopId,
        })),
      });
    }

    return successResponse(res, trip, 'Trip scheduled successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Start Trip (Driver or Admin)
 * POST /api/trips/:id/start
 */
const startTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.targetSchoolId;

    const trip = await prisma.trip.findFirst({
      where: { id, schoolId },
      include: { bus: true, route: { include: { stops: { orderBy: { sequence: 'asc' } } } } },
    });

    if (!trip) {
      return errorResponse(res, 'Trip not found', 404);
    }

    if (req.user.role === 'DRIVER' && trip.driverId !== req.user.driverId) {
      return errorResponse(res, 'Unauthorized: You are not assigned to drive this trip', 403);
    }

    const firstStopId = trip.route?.stops?.[0]?.id || null;

    const updated = await prisma.trip.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        actualStart: new Date(),
        currentStopId: firstStopId,
      },
      include: {
        bus: true,
        route: { include: { stops: { orderBy: { sequence: 'asc' } } } },
        studentStatuses: {
          include: { student: true },
        },
      },
    });

    // Emit Socket notification
    const io = req.app.get('io');
    if (io) {
      io.to(`school:${schoolId}`).emit('trip:started', {
        tripId: trip.id,
        busId: trip.busId,
        busNumber: trip.bus.busNumber,
        type: trip.type,
      });
      io.to(`bus:${trip.busId}`).emit('trip:started', {
        tripId: trip.id,
        busId: trip.busId,
        busNumber: trip.bus.busNumber,
      });
    }

    // Create Notification record
    await prisma.notification.create({
      data: {
        schoolId,
        recipientRole: 'PARENT',
        title: `${trip.bus.busNumber} Trip Started`,
        message: `${trip.bus.busNumber} has started its ${trip.type.toLowerCase()} trip.`,
        type: 'BUS_STARTED',
        metadata: JSON.stringify({ tripId: trip.id, busId: trip.busId }),
      },
    }).catch(() => {});

    return successResponse(res, updated, 'Trip started successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * End Trip (Driver or Admin)
 * POST /api/trips/:id/end
 */
const endTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.targetSchoolId;

    const trip = await prisma.trip.findFirst({
      where: { id, schoolId },
      include: { bus: true },
    });

    if (!trip) {
      return errorResponse(res, 'Trip not found', 404);
    }

    if (req.user.role === 'DRIVER' && trip.driverId !== req.user.driverId) {
      return errorResponse(res, 'Unauthorized to end this trip', 403);
    }

    const updated = await prisma.trip.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        actualEnd: new Date(),
      },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`school:${schoolId}`).emit('trip:ended', {
        tripId: trip.id,
        busId: trip.busId,
      });
      io.to(`bus:${trip.busId}`).emit('trip:ended', {
        tripId: trip.id,
        busId: trip.busId,
      });
    }

    return successResponse(res, updated, 'Trip marked completed');
  } catch (error) {
    next(error);
  }
};

/**
 * Update Current Stop on Trip
 * POST /api/trips/:id/next-stop
 */
const updateCurrentStop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stopId } = req.body;
    const schoolId = req.targetSchoolId;

    const trip = await prisma.trip.findFirst({
      where: { id, schoolId },
      include: { bus: true },
    });

    if (!trip) {
      return errorResponse(res, 'Trip not found', 404);
    }

    const updated = await prisma.trip.update({
      where: { id },
      data: { currentStopId: stopId },
      include: {
        route: { include: { stops: true } },
      },
    });

    const stop = await prisma.stop.findUnique({ where: { id: stopId } });

    const io = req.app.get('io');
    if (io) {
      io.to(`bus:${trip.busId}`).emit('trip:stop:update', {
        tripId: trip.id,
        busId: trip.busId,
        stopId,
        stopName: stop?.name,
      });
    }

    return successResponse(res, updated, 'Trip stop updated');
  } catch (error) {
    next(error);
  }
};

/**
 * Update Student Boarding Status (Driver workflow)
 * POST /api/trips/:id/student-status
 */
const updateStudentStatus = async (req, res, next) => {
  try {
    const { id: tripId } = req.params;
    const { studentId, status, stopId } = req.body;
    // Allowed: WAITING, PICKED_UP, ON_BUS, DROPPED_OFF, ABSENT

    const trip = await prisma.trip.findFirst({
      where: { id: tripId, schoolId: req.targetSchoolId },
      include: { bus: true },
    });

    if (!trip) {
      return errorResponse(res, 'Trip not found', 404);
    }

    const record = await prisma.studentTripStatus.upsert({
      where: {
        tripId_studentId: {
          tripId,
          studentId,
        },
      },
      update: {
        status,
        ...(stopId && { stopId }),
        markedAt: new Date(),
      },
      create: {
        tripId,
        studentId,
        status,
        stopId: stopId || null,
        markedAt: new Date(),
      },
      include: {
        student: {
          include: { family: true },
        },
      },
    });

    // Notify Family / Parent
    const io = req.app.get('io');
    if (io) {
      const eventType = status === 'PICKED_UP' ? 'STUDENT_PICKED_UP' : status === 'DROPPED_OFF' ? 'STUDENT_DROPPED' : 'STUDENT_STATUS';
      io.to(`family:${record.student.familyId}`).emit('student:status:update', {
        studentId,
        studentName: record.student.name,
        status,
        busNumber: trip.bus.busNumber,
        timestamp: new Date().toISOString(),
      });
    }

    // Persist Notification
    if (['PICKED_UP', 'DROPPED_OFF', 'ABSENT'].includes(status)) {
      const type = status === 'PICKED_UP' ? 'STUDENT_PICKED_UP' : status === 'DROPPED_OFF' ? 'STUDENT_DROPPED' : 'SCHOOL_ANNOUNCEMENT';
      const label = status === 'PICKED_UP' ? 'picked up' : status === 'DROPPED_OFF' ? 'safely dropped off' : 'marked absent';

      await prisma.notification.create({
        data: {
          schoolId: req.targetSchoolId,
          recipientRole: 'PARENT',
          familyId: record.student.familyId,
          title: `Student ${status === 'PICKED_UP' ? 'Boarded' : 'Drop Off'}`,
          message: `${record.student.name} was ${label} by ${trip.bus.busNumber}.`,
          type,
          metadata: JSON.stringify({ studentId, tripId, status }),
        },
      }).catch(() => {});
    }

    return successResponse(res, record, `Student status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

/**
 * Driver Active Trip shortcut
 * GET /api/trips/active/driver
 */
const getDriverActiveTrip = async (req, res, next) => {
  try {
    if (req.user.role !== 'DRIVER') {
      return errorResponse(res, 'Only drivers can access this endpoint', 403);
    }

    const trip = await prisma.trip.findFirst({
      where: {
        schoolId: req.targetSchoolId,
        driverId: req.user.driverId,
        status: { in: ['ACTIVE', 'SCHEDULED'] },
      },
      orderBy: { scheduledStart: 'desc' },
      include: {
        bus: true,
        route: {
          include: {
            stops: { orderBy: { sequence: 'asc' } },
          },
        },
        studentStatuses: {
          include: {
            student: {
              include: {
                pickupStop: true,
                dropStop: true,
                family: { include: { parents: true } },
              },
            },
          },
        },
      },
    });

    return successResponse(res, trip || null, 'Driver active trip retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTrips,
  getTripById,
  createTrip,
  startTrip,
  endTrip,
  updateCurrentStop,
  updateStudentStatus,
  getDriverActiveTrip,
};
