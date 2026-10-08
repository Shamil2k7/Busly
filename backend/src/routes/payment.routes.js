const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const { enforceTenant } = require('../middlewares/tenant.middleware');

router.use(authenticate);
router.use(enforceTenant);

router.get('/', paymentController.getPayments);
router.get('/:id/receipt', paymentController.getPaymentReceipt);
router.post('/checkout-intent', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PARENT']), paymentController.createCheckoutIntent);
router.post('/process', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PARENT']), paymentController.processPayment);

module.exports = router;
