const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authLimiter, otpLimiter } = require('../middlewares/rateLimiter.middleware');

// Public routes
router.post('/login', authLimiter, authController.loginAdmin);
router.post('/otp/request', otpLimiter, authController.requestOtp);
router.post('/otp/verify', authLimiter, authController.verifyOtp);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
