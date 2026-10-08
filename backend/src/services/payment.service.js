const crypto = require('crypto');

/**
 * Payment Provider Interface / Base Class
 */
class PaymentProvider {
  async createPaymentIntent(params) {
    throw new Error('createPaymentIntent must be implemented');
  }

  async verifyPayment(params) {
    throw new Error('verifyPayment must be implemented');
  }
}

/**
 * Safe Mock Payment Provider for sandbox / development
 */
class MockPaymentProvider extends PaymentProvider {
  async createPaymentIntent({ amount, currency = 'INR', referenceId, customerInfo }) {
    // Generate mock order/intent
    const orderId = `mock_order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    return {
      orderId,
      amount,
      currency,
      referenceId,
      status: 'CREATED',
      paymentUrl: `/parent/payment/mock-checkout?orderId=${orderId}`,
    };
  }

  async verifyPayment({ orderId, paymentMethod = 'UPI', simulateFailure = false }) {
    if (simulateFailure) {
      return {
        success: false,
        error: 'Card declined by issuing bank (Simulated failure)',
        status: 'FAILED',
      };
    }

    const transactionId = `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      success: true,
      transactionId,
      paymentMethod,
      status: 'SUCCESS',
      paidAt: new Date(),
    };
  }
}

// Factory to select active provider
function getPaymentProvider() {
  // In future, can switch based on env (e.g. process.env.PAYMENT_PROVIDER === 'STRIPE' ? StripeProvider : MockPaymentProvider)
  return new MockPaymentProvider();
}

module.exports = {
  PaymentProvider,
  MockPaymentProvider,
  getPaymentProvider,
};
