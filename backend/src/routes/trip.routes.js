const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const { enforceTenant } = require('../middlewares/tenant.middleware');

router.use(authenticate);
router.use(enforceTenant);

router.get('/', tripController.getTrips);
router.get('/active/driver', requireRole(['DRIVER']), tripController.getDriverActiveTrip);
router.get('/:id', tripController.getTripById);
router.post('/', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), tripController.createTrip);

// Driver/Admin actions
router.post('/:id/start', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DRIVER']), tripController.startTrip);
router.post('/:id/end', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DRIVER']), tripController.endTrip);
router.post('/:id/next-stop', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DRIVER']), tripController.updateCurrentStop);
router.post('/:id/student-status', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DRIVER']), tripController.updateStudentStatus);

module.exports = router;
