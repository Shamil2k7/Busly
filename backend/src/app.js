const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const config = require('./config/env');
const errorHandler = require('./middlewares/error.middleware');

// Route imports
const authRoutes = require('./routes/auth.routes');
const schoolRoutes = require('./routes/school.routes');
const studentRoutes = require('./routes/student.routes');
const teacherRoutes = require('./routes/teacher.routes');
const driverRoutes = require('./routes/driver.routes');
const busRoutes = require('./routes/bus.routes');
const routeRoutes = require('./routes/route.routes');
const tripRoutes = require('./routes/trip.routes');
const feeRoutes = require('./routes/fee.routes');
const paymentRoutes = require('./routes/payment.routes');
const emergencyRoutes = require('./routes/emergency.routes');
const notificationRoutes = require('./routes/notification.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();

// Dynamic CORS resolver supporting localhost, configured frontendUrl, and *.vercel.app deployments
const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (
    origin === config.frontendUrl ||
    origin === 'http://localhost:3000' ||
    origin === 'http://127.0.0.1:3000'
  ) {
    return true;
  }
  try {
    const parsed = new URL(origin);
    if (parsed.hostname.endsWith('.vercel.app') || parsed.hostname === 'localhost') {
      return true;
    }
  } catch (e) {
    // ignore parsing errors
  }
  return true;
};

app.use(cors({
  origin: (origin, callback) => {
    callback(null, isAllowedOrigin(origin));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Root Welcome & API Discovery Route
app.get('/', (req, res) => {
  res.json({
    name: 'Busly API',
    tagline: 'Smart School Transport SaaS Platform',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      schools: '/api/schools',
      students: '/api/students',
      buses: '/api/buses',
      routes: '/api/routes',
      trips: '/api/trips',
      fees: '/api/fees',
      payments: '/api/payments',
      emergency: '/api/emergency',
      notifications: '/api/notifications',
      reports: '/api/reports',
    },
    time: new Date().toISOString(),
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Busly API Server',
    environment: config.nodeEnv,
    time: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;
