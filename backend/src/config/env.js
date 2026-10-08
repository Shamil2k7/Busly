require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'busly_dev_secret_fallback_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  otpSecret: process.env.OTP_SECRET || 'busly_otp_secret_fallback',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  socketUrl: process.env.SOCKET_URL || 'http://localhost:5000',
  paymentSecret: process.env.PAYMENT_SECRET || 'mock_payment_secret',
  mapsApiKey: process.env.MAPS_API_KEY || 'mock_maps_key',
};

if (!config.databaseUrl) {
  console.warn('WARNING: DATABASE_URL is not set.');
}

module.exports = config;
