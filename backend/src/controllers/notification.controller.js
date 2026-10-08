const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get Notifications for authenticated user
 * GET /api/notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const { unreadOnly } = req.query;

    const where = { schoolId };

    if (req.user.role === 'PARENT') {
      where.OR = [
        { familyId: req.user.familyId },
        { recipientRole: 'PARENT' },
        { recipientRole: 'ALL' },
      ];
    } else if (req.user.role === 'TEACHER') {
      where.OR = [
        { recipientUserId: req.user.id },
        { recipientRole: 'TEACHER' },
        { recipientRole: 'ALL' },
      ];
    } else if (req.user.role === 'DRIVER') {
      where.OR = [
        { recipientUserId: req.user.id },
        { recipientRole: 'DRIVER' },
        { recipientRole: 'ALL' },
      ];
    } else if (req.user.role === 'SCHOOL_ADMIN') {
      where.OR = [
        { recipientUserId: req.user.id },
        { recipientRole: 'SCHOOL_ADMIN' },
        { recipientRole: 'ALL' },
      ];
    }

    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        ...where,
        isRead: false,
      },
    });

    return successResponse(res, {
      notifications,
      unreadCount,
    }, 'Notifications retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.targetSchoolId;

    const notification = await prisma.notification.findFirst({
      where: { id, schoolId },
    });

    if (!notification) {
      return errorResponse(res, 'Notification not found', 404);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return successResponse(res, updated, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 * POST /api/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;

    await prisma.notification.updateMany({
      where: {
        schoolId,
        ...(req.user.role === 'PARENT' ? { familyId: req.user.familyId } : {}),
      },
      data: { isRead: true },
    });

    return successResponse(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Send School Announcement (School Admin)
 * POST /api/notifications/announcement
 */
const sendAnnouncement = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const { title, message, recipientRole = 'ALL' } = req.body;

    if (!title || !message) {
      return errorResponse(res, 'Title and message are required', 400);
    }

    const announcement = await prisma.notification.create({
      data: {
        schoolId,
        recipientRole,
        title: title.trim(),
        message: message.trim(),
        type: 'SCHOOL_ANNOUNCEMENT',
      },
    });

    // Real-time broadcast
    const io = req.app.get('io');
    if (io) {
      io.to(`school:${schoolId}`).emit('announcement:new', {
        id: announcement.id,
        title,
        message,
        recipientRole,
        createdAt: announcement.createdAt,
      });
    }

    return successResponse(res, announcement, 'Announcement sent successfully', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  sendAnnouncement,
};
