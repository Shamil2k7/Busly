const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/school.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const { enforceTenant } = require('../middlewares/tenant.middleware');

router.use(authenticate);

// School Tenant Endpoints
router.get('/', enforceTenant, schoolController.getSchools);
router.get('/:id', enforceTenant, schoolController.getSchoolById);
router.post('/', requireRole(['SUPER_ADMIN']), schoolController.createSchool);
router.put('/:id', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), enforceTenant, schoolController.updateSchool);
router.patch('/:id', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), enforceTenant, schoolController.updateSchool);

// School Administrator Management Endpoints (SUPER_ADMIN only)
router.get('/:id/admins', requireRole(['SUPER_ADMIN']), schoolController.getSchoolAdmins);
router.post('/:id/admins', requireRole(['SUPER_ADMIN']), schoolController.createSchoolAdmin);
router.patch('/:id/admins/:adminId/status', requireRole(['SUPER_ADMIN']), schoolController.toggleSchoolAdminStatus);

module.exports = router;
