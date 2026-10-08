const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergency.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const { enforceTenant } = require('../middlewares/tenant.middleware');

router.use(authenticate);
router.use(enforceTenant);

router.get('/', emergencyController.getEmergencyAlerts);
router.post('/sos', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DRIVER']), emergencyController.triggerSos);
router.patch('/:id/status', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), emergencyController.updateAlertStatus);

module.exports = router;
