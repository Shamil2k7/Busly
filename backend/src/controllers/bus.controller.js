const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getBuses = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const { status } = req.query;

    const where = { schoolId };
    if (status) where.status = status;

    // Driver can only see their assigned bus
    if (req.user.role === 'DRIVER') {
      where.driverId = req.user.driverId;
    }

    const buses = await prisma.bus.findMany({
      where,
      include: {
        driver: { select: { id: true, name: true, mobile: true, licenseNumber: true } },
        route: {
          select: {
            id: true,
            name: true,
            stops: {
              orderBy: { sequence: 'asc' },
              select: { id: true, name: true, sequence: true, estimatedArrival: true, latitude: true, longitude: true },
            },
          },
        },
        _count: {
          select: { students: true },
        },
        locationLogs: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { busNumber: 'asc' },
    });

    return successResponse(res, buses, 'Buses retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getBusById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.targetSchoolId;

    const bus = await prisma.bus.findFirst({
      where: { id, schoolId },
      include: {
        driver: true,
        route: {
          include: {
            stops: { orderBy: { sequence: 'asc' } },
          },
        },
        students: {
          select: {
            id: true,
            studentId: true,
            name: true,
            class: true,
            division: true,
            pickupStop: { select: { id: true, name: true } },
            dropStop: { select: { id: true, name: true } },
          },
        },
        trips: {
          where: { status: 'ACTIVE' },
          take: 1,
          include: {
            studentStatuses: {
              include: {
                student: { select: { id: true, name: true, studentId: true } },
              },
            },
          },
        },
        locationLogs: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!bus) {
      return errorResponse(res, 'Bus not found', 404);
    }

    return successResponse(res, bus, 'Bus details retrieved');
  } catch (error) {
    next(error);
  }
};

const createBus = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const { busNumber, registrationNumber, capacity = 30, driverId, routeId, status = 'ACTIVE' } = req.body;

    if (!busNumber || !registrationNumber) {
      return errorResponse(res, 'Bus number and registration number are required', 400);
    }

    const existing = await prisma.bus.findFirst({
      where: { schoolId, busNumber: busNumber.trim() },
    });
    if (existing) {
      return errorResponse(res, `Bus number ${busNumber} already exists in this school`, 409);
    }

    const bus = await prisma.bus.create({
      data: {
        schoolId,
        busNumber: busNumber.trim(),
        registrationNumber: registrationNumber.trim().toUpperCase(),
        capacity: parseInt(capacity, 10),
        driverId: driverId || null,
        routeId: routeId || null,
        status,
      },
      include: {
        driver: true,
        route: true,
      },
    });

    return successResponse(res, bus, 'Bus created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateBus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.targetSchoolId;
    const { busNumber, registrationNumber, capacity, driverId, routeId, status } = req.body;

    const existing = await prisma.bus.findFirst({
      where: { id, schoolId },
    });
    if (!existing) {
      return errorResponse(res, 'Bus not found', 404);
    }

    const updated = await prisma.bus.update({
      where: { id },
      data: {
        ...(busNumber && { busNumber: busNumber.trim() }),
        ...(registrationNumber && { registrationNumber: registrationNumber.trim().toUpperCase() }),
        ...(capacity !== undefined && { capacity: parseInt(capacity, 10) }),
        ...(driverId !== undefined && { driverId: driverId || null }),
        ...(routeId !== undefined && { routeId: routeId || null }),
        ...(status && { status }),
      },
      include: {
        driver: true,
        route: true,
      },
    });

    return successResponse(res, updated, 'Bus updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteBus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.targetSchoolId;

    const existing = await prisma.bus.findFirst({
      where: { id, schoolId },
    });
    if (!existing) {
      return errorResponse(res, 'Bus not found', 404);
    }

    await prisma.bus.delete({ where: { id } });
    return successResponse(res, null, 'Bus deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
};
