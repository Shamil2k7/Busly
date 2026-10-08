const express = require('express');
const router = express.Router();
const busController = require('../controllers/bus.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const { enforceTenant } = require('../middlewares/tenant.middleware');

router.use(authenticate);
router.use(enforceTenant);

router.get('/', busController.getBuses);
router.get('/:id', busController.getBusById);
router.post('/', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), busController.createBus);
router.put('/:id', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), busController.updateBus);
router.delete('/:id', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), busController.deleteBus);

module.exports = router;
