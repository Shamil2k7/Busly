const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const { enforceTenant } = require('../middlewares/tenant.middleware');

router.use(authenticate);

router.get('/dashboard/admin', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), enforceTenant, reportController.getAdminDashboard);
router.get('/dashboard/teacher', requireRole(['TEACHER']), enforceTenant, reportController.getTeacherDashboard);
router.get('/dashboard/driver', requireRole(['DRIVER']), enforceTenant, reportController.getDriverDashboard);
router.get('/dashboard/parent', requireRole(['PARENT']), enforceTenant, reportController.getParentDashboard);
router.get('/super-admin', requireRole(['SUPER_ADMIN']), reportController.getSuperAdminMetrics);

module.exports = router;
