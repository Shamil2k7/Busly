const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driver.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const { enforceTenant } = require('../middlewares/tenant.middleware');

router.use(authenticate);
router.use(enforceTenant);

router.get('/', driverController.getDrivers);
router.get('/:id', driverController.getDriverById);
router.post('/', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), driverController.createDriver);
router.put('/:id', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DRIVER']), driverController.updateDriver);
router.delete('/:id', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), driverController.deleteDriver);

module.exports = router;
