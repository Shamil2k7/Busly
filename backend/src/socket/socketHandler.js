const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/db');

function initializeSocket(io) {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error('Invalid token'));
      }

      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    // console.log(`[Socket] User connected: ${user.role} (${user.id || user.parentId})`);

    // 1. Automatically join user to their school room (if applicable)
    if (user.schoolId) {
      socket.join(`school:${user.schoolId}`);
    }

    // 2. Personal user room
    if (user.id) {
      socket.join(`user:${user.id}`);
    } else if (user.parentId) {
      socket.join(`parent:${user.parentId}`);
      if (user.familyId) {
        socket.join(`family:${user.familyId}`);
      }
    }

    // 3. Driver/Admin/Teacher/Parent joins specific bus room
    socket.on('join:bus', async ({ busId }) => {
      if (!busId) return;

      // Authorization check: Verify bus belongs to user's school
      if (user.role !== 'SUPER_ADMIN') {
        const bus = await prisma.bus.findFirst({
          where: { id: busId, schoolId: user.schoolId },
        });

        if (!bus) {
          socket.emit('error', { message: 'Unauthorized to track this bus' });
          return;
        }

        // If parent, verify child is assigned to this bus
        if (user.role === 'PARENT') {
          const childAssigned = await prisma.student.findFirst({
            where: {
              familyId: user.familyId,
              busId: busId,
            },
          });
          if (!childAssigned) {
            socket.emit('error', { message: 'Unauthorized: No child assigned to this bus' });
            return;
          }
        }
      }

      socket.join(`bus:${busId}`);
      socket.emit('joined:bus', { busId });
    });

    socket.on('leave:bus', ({ busId }) => {
      socket.leave(`bus:${busId}`);
    });

    // 4. Live location update from Driver
    socket.on('driver:location:update', async (data) => {
      try {
        if (user.role !== 'DRIVER') {
          socket.emit('error', { message: 'Only drivers can broadcast location' });
          return;
        }

        const { busId, tripId, latitude, longitude, speed = 0, heading = 0 } = data;
        if (!busId || latitude === undefined || longitude === undefined) return;

        const timestamp = new Date().toISOString();

        // Broadcast to bus room and school admin room
        const payload = {
          busId,
          tripId: tripId || null,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          speed: parseFloat(speed),
          heading: parseFloat(heading),
          timestamp,
        };

        io.to(`bus:${busId}`).emit('bus:location:update', payload);
        io.to(`school:${user.schoolId}`).emit('bus:location:update', payload);

        // Periodically or asynchronously record location in DB
        await prisma.busLocationLog.create({
          data: {
            busId,
            tripId: tripId || null,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            speed: parseFloat(speed),
            heading: parseFloat(heading),
          },
        }).catch((e) => console.error('Error logging bus location:', e.message));
      } catch (err) {
        console.error('Error handling location update:', err);
      }
    });

    // 5. Driver SOS Emergency Event
    socket.on('driver:sos', async (data) => {
      try {
        if (user.role !== 'DRIVER') return;

        const { busId, tripId, latitude, longitude, reason = 'Emergency SOS triggered by driver' } = data;

        // Create alert in DB
        const alert = await prisma.emergencyAlert.create({
          data: {
            schoolId: user.schoolId,
            busId,
            driverId: user.driverId,
            tripId: tripId || null,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            reason,
            status: 'ACTIVE',
          },
          include: {
            bus: true,
            driver: true,
          },
        });

        // Broadcast urgent alert to School Admin and specific bus followers
        const emergencyPayload = {
          alertId: alert.id,
          busId,
          busNumber: alert.bus.busNumber,
          driverName: alert.driver.name,
          driverMobile: alert.driver.mobile,
          tripId,
          latitude,
          longitude,
          reason,
          timestamp: new Date().toISOString(),
          status: 'ACTIVE',
        };

        io.to(`school:${user.schoolId}`).emit('emergency:alert', emergencyPayload);
        io.to(`bus:${busId}`).emit('emergency:alert', emergencyPayload);
      } catch (err) {
        console.error('Error broadcasting SOS:', err);
      }
    });

    socket.on('disconnect', () => {
      // Cleanup
    });
  });

  return io;
}

module.exports = {
  initializeSocket,
};
