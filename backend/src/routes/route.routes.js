const express = require('express');
const router = express.Router();
const routeController = require('../controllers/route.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const { enforceTenant } = require('../middlewares/tenant.middleware');

router.use(authenticate);
router.use(enforceTenant);

router.get('/', routeController.getRoutes);
router.get('/:id', routeController.getRouteById);
router.post('/', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), routeController.createRoute);
router.put('/:id', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), routeController.updateRoute);
router.delete('/:id', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), routeController.deleteRoute);

// Stops sub-resources
router.post('/:id/stops', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), routeController.addStop);
router.put('/stops/:stopId', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), routeController.updateStop);
router.delete('/stops/:stopId', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), routeController.deleteStop);

module.exports = router;
