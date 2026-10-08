const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getDrivers = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const drivers = await prisma.driver.findMany({
      where: { schoolId },
      include: {
        buses: { select: { id: true, busNumber: true, registrationNumber: true } },
        user: { select: { id: true, email: true, status: true } },
      },
      orderBy: { name: 'asc' },
    });
    return successResponse(res, drivers, 'Drivers retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getDriverById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.targetSchoolId;

    const driver = await prisma.driver.findFirst({
      where: { id, schoolId },
      include: {
        buses: {
          include: {
            route: {
              include: { stops: { orderBy: { sequence: 'asc' } } },
            },
          },
        },
        trips: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        user: true,
      },
    });

    if (!driver) {
      return errorResponse(res, 'Driver not found', 404);
    }

    return successResponse(res, driver, 'Driver details retrieved');
  } catch (error) {
    next(error);
  }
};

const createDriver = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const { name, mobile, licenseNumber } = req.body;

    if (!name || !mobile || !licenseNumber) {
      return errorResponse(res, 'Driver name, mobile number, and license number are required', 400);
    }

    const existingLicense = await prisma.driver.findFirst({
      where: { schoolId, licenseNumber: licenseNumber.trim() },
    });
    if (existingLicense) {
      return errorResponse(res, `License number ${licenseNumber} is already registered`, 409);
    }

    const existingMobile = await prisma.driver.findFirst({
      where: { schoolId, mobile: mobile.trim() },
    });
    if (existingMobile) {
      return errorResponse(res, `Mobile number ${mobile} is already registered to a driver`, 409);
    }

    const user = await prisma.user.create({
      data: {
        schoolId,
        name: name.trim(),
        mobile: mobile.trim(),
        role: 'DRIVER',
        status: 'ACTIVE',
      },
    });

    const driver = await prisma.driver.create({
      data: {
        schoolId,
        userId: user.id,
        name: name.trim(),
        mobile: mobile.trim(),
        licenseNumber: licenseNumber.trim(),
        status: 'ACTIVE',
      },
    });

    return successResponse(res, driver, 'Driver registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.targetSchoolId;
    const { name, mobile, licenseNumber, status } = req.body;

    const driver = await prisma.driver.findFirst({
      where: { id, schoolId },
    });
    if (!driver) {
      return errorResponse(res, 'Driver not found', 404);
    }

    const updated = await prisma.driver.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(mobile && { mobile: mobile.trim() }),
        ...(licenseNumber && { licenseNumber: licenseNumber.trim() }),
        ...(status && { status }),
      },
    });

    if (driver.userId) {
      await prisma.user.update({
        where: { id: driver.userId },
        data: {
          ...(name && { name: name.trim() }),
          ...(mobile && { mobile: mobile.trim() }),
          ...(status && { status }),
        },
      });
    }

    return successResponse(res, updated, 'Driver updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.targetSchoolId;

    const driver = await prisma.driver.findFirst({
      where: { id, schoolId },
    });
    if (!driver) {
      return errorResponse(res, 'Driver not found', 404);
    }

    await prisma.driver.delete({ where: { id } });
    if (driver.userId) {
      await prisma.user.delete({ where: { id: driver.userId } }).catch(() => {});
    }

    return successResponse(res, null, 'Driver deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
};
