const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/school.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const { enforceTenant } = require('../middlewares/tenant.middleware');

router.use(authenticate);

router.get('/', enforceTenant, schoolController.getSchools);
router.get('/:id', enforceTenant, schoolController.getSchoolById);
router.post('/', requireRole(['SUPER_ADMIN']), schoolController.createSchool);
router.put('/:id', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), enforceTenant, schoolController.updateSchool);

module.exports = router;
