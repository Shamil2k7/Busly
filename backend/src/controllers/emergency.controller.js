const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * List Emergency Alerts
 * GET /api/emergency
 */
const getEmergencyAlerts = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const { status } = req.query;

    const where = { schoolId };
    if (status) where.status = status;

    const alerts = await prisma.emergencyAlert.findMany({
      where,
      include: {
        bus: { select: { id: true, busNumber: true, registrationNumber: true } },
        driver: { select: { id: true, name: true, mobile: true } },
        trip: { select: { id: true, type: true, routeId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, alerts, 'Emergency alerts retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger SOS Emergency Alert (Driver)
 * POST /api/emergency/sos
 */
const triggerSos = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const { busId, tripId, latitude, longitude, reason = 'Urgent assistance requested by driver' } = req.body;

    if (!busId) {
      return errorResponse(res, 'Bus ID is required for SOS', 400);
    }

    const bus = await prisma.bus.findFirst({
      where: { id: busId, schoolId },
      include: { driver: true },
    });

    if (!bus) {
      return errorResponse(res, 'Bus not found', 404);
    }

    const driverId = req.user.driverId || bus.driverId;

    const alert = await prisma.emergencyAlert.create({
      data: {
        schoolId,
        busId,
        driverId,
        tripId: tripId || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        reason: reason.trim(),
        status: 'ACTIVE',
      },
      include: {
        bus: true,
        driver: true,
      },
    });

    // Notify School Admin via DB notification
    await prisma.notification.create({
      data: {
        schoolId,
        recipientRole: 'SCHOOL_ADMIN',
        title: `🚨 SOS ALERT: ${bus.busNumber}`,
        message: `Driver ${bus.driver?.name || 'Driver'} triggered SOS: "${reason}". Immediate action required.`,
        type: 'EMERGENCY',
        metadata: JSON.stringify({ alertId: alert.id, busId, latitude, longitude }),
      },
    });

    // Real-time broadcast
    const io = req.app.get('io');
    if (io) {
      const payload = {
        alertId: alert.id,
        busId,
        busNumber: bus.busNumber,
        driverName: bus.driver?.name,
        driverMobile: bus.driver?.mobile,
        tripId,
        latitude,
        longitude,
        reason,
        status: 'ACTIVE',
        timestamp: new Date().toISOString(),
      };
      io.to(`school:${schoolId}`).emit('emergency:alert', payload);
      io.to(`bus:${busId}`).emit('emergency:alert', payload);
    }

    return successResponse(res, alert, 'SOS alert dispatched immediately to school administration', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update SOS Alert Status (ACKNOWLEDGED or RESOLVED)
 * PATCH /api/emergency/:id/status
 */
const updateAlertStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.targetSchoolId;
    const { status } = req.body; // ACKNOWLEDGED, RESOLVED

    if (!['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'].includes(status)) {
      return errorResponse(res, 'Status must be ACTIVE, ACKNOWLEDGED, or RESOLVED', 400);
    }

    const alert = await prisma.emergencyAlert.findFirst({
      where: { id, schoolId },
      include: { bus: true },
    });

    if (!alert) {
      return errorResponse(res, 'Emergency alert not found', 404);
    }

    const dataToUpdate = { status };
    if (status === 'ACKNOWLEDGED') {
      dataToUpdate.acknowledgedBy = req.user.name;
    } else if (status === 'RESOLVED') {
      dataToUpdate.resolvedBy = req.user.name;
    }

    const updated = await prisma.emergencyAlert.update({
      where: { id },
      data: dataToUpdate,
      include: { bus: true, driver: true },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`school:${schoolId}`).emit('emergency:status:update', {
        alertId: id,
        status,
        updatedBy: req.user.name,
      });
    }

    return successResponse(res, updated, `Alert marked as ${status}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmergencyAlerts,
  triggerSos,
  updateAlertStatus,
};
