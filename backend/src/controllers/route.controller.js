const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getRoutes = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const routes = await prisma.route.findMany({
      where: { schoolId },
      include: {
        bus: { select: { id: true, busNumber: true, registrationNumber: true } },
        stops: {
          orderBy: { sequence: 'asc' },
        },
        _count: {
          select: { trips: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return successResponse(res, routes, 'Routes retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getRouteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.targetSchoolId;

    const route = await prisma.route.findFirst({
      where: { id, schoolId },
      include: {
        bus: {
          include: {
            driver: true,
          },
        },
        stops: {
          orderBy: { sequence: 'asc' },
          include: {
            _count: {
              select: {
                pickupStudents: true,
                dropStudents: true,
              },
            },
          },
        },
      },
    });

    if (!route) {
      return errorResponse(res, 'Route not found', 404);
    }

    return successResponse(res, route, 'Route details retrieved');
  } catch (error) {
    next(error);
  }
};

const createRoute = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const { name, busId, stops = [] } = req.body;

    if (!name) {
      return errorResponse(res, 'Route name is required', 400);
    }

    const route = await prisma.route.create({
      data: {
        schoolId,
        name: name.trim(),
        busId: busId || null,
        status: 'ACTIVE',
      },
    });

    // If initial stops provided
    if (stops && stops.length > 0) {
      for (let i = 0; i < stops.length; i++) {
        const s = stops[i];
        await prisma.stop.create({
          data: {
            routeId: route.id,
            name: s.name.trim(),
            latitude: parseFloat(s.latitude || 11.2785),
            longitude: parseFloat(s.longitude || 76.2280),
            sequence: s.sequence !== undefined ? parseInt(s.sequence, 10) : i + 1,
            estimatedArrival: s.estimatedArrival || null,
          },
        });
      }
    }

    const fullRoute = await prisma.route.findUnique({
      where: { id: route.id },
      include: { stops: { orderBy: { sequence: 'asc' } } },
    });

    return successResponse(res, fullRoute, 'Route created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.targetSchoolId;
    const { name, busId, status } = req.body;

    const existing = await prisma.route.findFirst({
      where: { id, schoolId },
    });
    if (!existing) {
      return errorResponse(res, 'Route not found', 404);
    }

    const updated = await prisma.route.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(busId !== undefined && { busId: busId || null }),
        ...(status && { status }),
      },
      include: {
        stops: { orderBy: { sequence: 'asc' } },
        bus: true,
      },
    });

    return successResponse(res, updated, 'Route updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.targetSchoolId;

    const existing = await prisma.route.findFirst({
      where: { id, schoolId },
    });
    if (!existing) {
      return errorResponse(res, 'Route not found', 404);
    }

    await prisma.route.delete({ where: { id } });
    return successResponse(res, null, 'Route deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Stops management
const addStop = async (req, res, next) => {
  try {
    const { id: routeId } = req.params;
    const schoolId = req.targetSchoolId;
    const { name, latitude, longitude, sequence, estimatedArrival } = req.body;

    const route = await prisma.route.findFirst({
      where: { id: routeId, schoolId },
    });
    if (!route) {
      return errorResponse(res, 'Route not found', 404);
    }

    const stop = await prisma.stop.create({
      data: {
        routeId,
        name: name.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        sequence: parseInt(sequence || 1, 10),
        estimatedArrival: estimatedArrival || null,
      },
    });

    return successResponse(res, stop, 'Stop added successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateStop = async (req, res, next) => {
  try {
    const { stopId } = req.params;
    const { name, latitude, longitude, sequence, estimatedArrival } = req.body;

    const existing = await prisma.stop.findUnique({
      where: { id: stopId },
      include: { route: true },
    });
    if (!existing || (req.user.role !== 'SUPER_ADMIN' && existing.route.schoolId !== req.targetSchoolId)) {
      return errorResponse(res, 'Stop not found or unauthorized', 404);
    }

    const updated = await prisma.stop.update({
      where: { id: stopId },
      data: {
        ...(name && { name: name.trim() }),
        ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
        ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
        ...(sequence !== undefined && { sequence: parseInt(sequence, 10) }),
        ...(estimatedArrival !== undefined && { estimatedArrival }),
      },
    });

    return successResponse(res, updated, 'Stop updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteStop = async (req, res, next) => {
  try {
    const { stopId } = req.params;

    const existing = await prisma.stop.findUnique({
      where: { id: stopId },
      include: { route: true },
    });
    if (!existing || (req.user.role !== 'SUPER_ADMIN' && existing.route.schoolId !== req.targetSchoolId)) {
      return errorResponse(res, 'Stop not found or unauthorized', 404);
    }

    await prisma.stop.delete({ where: { id: stopId } });
    return successResponse(res, null, 'Stop deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  addStop,
  updateStop,
  deleteStop,
};
