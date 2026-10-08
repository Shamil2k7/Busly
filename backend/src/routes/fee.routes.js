const express = require('express');
const router = express.Router();
const feeController = require('../controllers/fee.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const { enforceTenant } = require('../middlewares/tenant.middleware');

router.use(authenticate);
router.use(enforceTenant);

// Fee plans
router.get('/plans', feeController.getFeePlans);
router.post('/plans', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), feeController.createFeePlan);

// Student fees
router.get('/students', feeController.getStudentFees);
router.post('/assign', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), feeController.assignFees);

module.exports = router;
