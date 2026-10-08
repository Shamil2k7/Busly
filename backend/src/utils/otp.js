const crypto = require('crypto');
const prisma = require('../config/db');

/**
 * Generate 6-digit numeric OTP
 */
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash OTP using crypto SHA256
 */
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Create or replace OTP session in database
 */
const createOtpSession = async ({ mobile, role, schoolId = null, familyId = null }) => {
  // If in dev, we can use a predictable OTP or random
  const rawOtp = process.env.NODE_ENV === 'development' ? '123456' : generateOtp();
  const otpHash = hashOtp(rawOtp);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

  const session = await prisma.otpSession.create({
    data: {
      mobile,
      role,
      schoolId,
      familyId,
      otpHash,
      attempts: 0,
      expiresAt,
      verified: false,
    },
  });

  return {
    sessionId: session.id,
    otp: rawOtp, // Returned only for delivery (SMS / dev logs)
    expiresAt,
  };
};

/**
 * Verify OTP session with attempt limiting
 */
const verifyOtpSession = async ({ sessionId, mobile, role, otp }) => {
  const session = await prisma.otpSession.findFirst({
    where: {
      id: sessionId,
      mobile,
      role,
      verified: false,
    },
  });

  if (!session) {
    return { success: false, message: 'Invalid or expired OTP session' };
  }

  // Check expiration
  if (new Date() > new Date(session.expiresAt)) {
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  // Check maximum attempts (max 5)
  if (session.attempts >= 5) {
    return { success: false, message: 'Maximum OTP attempts exceeded. Please request a new OTP.' };
  }

  // Check hash
  const incomingHash = hashOtp(otp);
  if (session.otpHash !== incomingHash) {
    // Increment attempts
    await prisma.otpSession.updateMany({
      where: { id: session.id },
      data: { attempts: { increment: 1 } },
    });
    const remaining = 4 - session.attempts;
    return {
      success: false,
      message: `Incorrect OTP. ${Math.max(0, remaining)} attempt(s) remaining.`,
    };
  }

  // Mark verified
  await prisma.otpSession.updateMany({
    where: { id: session.id },
    data: { verified: true },
  });

  return { success: true, session };
};

module.exports = {
  generateOtp,
  hashOtp,
  createOtpSession,
  verifyOtpSession,
};
