const prisma = require('../config/db');
const { getPaymentProvider } = require('../services/payment.service');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Generate unique receipt number e.g. RCP-2026-0042
 */
async function generateReceiptNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.payment.count();
  const padded = String(count + 1).padStart(4, '0');
  return `RCP-${year}-${padded}`;
}

/**
 * List Payments (Admin views school, Parent views family)
 * GET /api/payments
 */
const getPayments = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const { status, search } = req.query;

    const where = { schoolId };

    if (req.user.role === 'PARENT') {
      where.familyId = req.user.familyId;
    }

    if (status) where.status = status;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        student: {
          select: { id: true, name: true, studentId: true, class: true, division: true },
        },
        family: {
          select: { familyCode: true },
        },
        studentFee: {
          include: { feePlan: true },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    return successResponse(res, payments, 'Payments retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create Payment Checkout Intent
 * POST /api/payments/checkout-intent
 */
const createCheckoutIntent = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const { studentFeeId, paymentMethod = 'UPI' } = req.body;

    if (!studentFeeId) {
      return errorResponse(res, 'Student fee ID is required', 400);
    }

    const fee = await prisma.studentFee.findFirst({
      where: { id: studentFeeId, schoolId },
      include: {
        student: true,
        feePlan: true,
      },
    });

    if (!fee) {
      return errorResponse(res, 'Fee record not found', 404);
    }

    if (req.user.role === 'PARENT' && fee.familyId !== req.user.familyId) {
      return errorResponse(res, 'Unauthorized to pay for this student fee', 403);
    }

    if (fee.status === 'PAID') {
      return errorResponse(res, 'This fee has already been paid in full', 400);
    }

    const provider = getPaymentProvider();
    const intent = await provider.createPaymentIntent({
      amount: fee.totalAmount,
      referenceId: fee.id,
      customerInfo: {
        familyId: fee.familyId,
        studentName: fee.student.name,
      },
    });

    return successResponse(res, {
      ...intent,
      feeDetails: {
        feeId: fee.id,
        studentName: fee.student.name,
        planName: fee.feePlan.name,
        billingPeriod: fee.billingPeriodLabel,
        amount: fee.totalAmount,
      },
    }, 'Payment intent initialized');
  } catch (error) {
    next(error);
  }
};

/**
 * Process / Complete Payment (Mock provider execution)
 * POST /api/payments/process
 */
const processPayment = async (req, res, next) => {
  try {
    const schoolId = req.targetSchoolId;
    const { studentFeeId, paymentMethod = 'UPI', simulateFailure = false } = req.body;

    const fee = await prisma.studentFee.findFirst({
      where: { id: studentFeeId, schoolId },
      include: {
        student: true,
        feePlan: true,
      },
    });

    if (!fee) {
      return errorResponse(res, 'Student fee not found', 404);
    }

    if (req.user.role === 'PARENT' && fee.familyId !== req.user.familyId) {
      return errorResponse(res, 'Unauthorized to process payment for this record', 403);
    }

    const provider = getPaymentProvider();
    const result = await provider.verifyPayment({
      orderId: `order_${fee.id}`,
      paymentMethod,
      simulateFailure,
    });

    if (!result.success) {
      // Record failed transaction attempt
      await prisma.payment.create({
        data: {
          schoolId,
          familyId: fee.familyId,
          studentId: fee.studentId,
          studentFeeId: fee.id,
          amount: fee.totalAmount,
          paymentReference: `FAIL-${Date.now()}`,
          paymentMethod,
          status: 'FAILED',
          receiptNumber: `FAIL-RCP-${Date.now()}`,
          metadata: JSON.stringify({ error: result.error }),
        },
      });

      return errorResponse(res, result.error || 'Payment failed', 400);
    }

    const receiptNumber = await generateReceiptNumber();

    // Record successful Payment
    const payment = await prisma.payment.create({
      data: {
        schoolId,
        familyId: fee.familyId,
        studentId: fee.studentId,
        studentFeeId: fee.id,
        amount: fee.totalAmount,
        paymentReference: result.transactionId,
        paymentMethod,
        status: 'SUCCESS',
        paidAt: result.paidAt,
        receiptNumber,
        metadata: JSON.stringify({ txnId: result.transactionId }),
      },
      include: {
        student: true,
        school: true,
      },
    });

    // Mark fee as PAID
    await prisma.studentFee.update({
      where: { id: fee.id },
      data: { status: 'PAID' },
    });

    // Trigger Notification
    await prisma.notification.create({
      data: {
        schoolId,
        recipientRole: 'PARENT',
        familyId: fee.familyId,
        title: 'Fee Payment Successful',
        message: `Payment of ₹${payment.amount} for ${fee.student.name} was successful. Receipt: ${receiptNumber}`,
        type: 'PAYMENT_SUCCESS',
        metadata: JSON.stringify({ paymentId: payment.id, receiptNumber }),
      },
    }).catch(() => {});

    // Emit Socket notification to parent
    const io = req.app.get('io');
    if (io) {
      io.to(`family:${fee.familyId}`).emit('payment:success', {
        receiptNumber,
        amount: payment.amount,
        studentName: fee.student.name,
      });
    }

    return successResponse(res, payment, 'Payment processed successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Payment Receipt by ID or Receipt Number
 * GET /api/payments/:id/receipt
 */
const getPaymentReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.targetSchoolId;

    const payment = await prisma.payment.findFirst({
      where: {
        schoolId,
        OR: [{ id }, { receiptNumber: id }],
      },
      include: {
        school: true,
        student: {
          include: { bus: true },
        },
        family: {
          include: { parents: true },
        },
        studentFee: {
          include: { feePlan: true },
        },
      },
    });

    if (!payment) {
      return errorResponse(res, 'Receipt not found', 404);
    }

    if (req.user.role === 'PARENT' && payment.familyId !== req.user.familyId) {
      return errorResponse(res, 'Unauthorized to view this receipt', 403);
    }

    return successResponse(res, payment, 'Receipt details retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayments,
  createCheckoutIntent,
  processPayment,
  getPaymentReceipt,
};
