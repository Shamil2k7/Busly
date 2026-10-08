const test = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

// Helper to make mock requests to express app using native http / fetch once server is listening
let server;
let baseUrl;

test.before(async () => {
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  return new Promise((resolve) => {
    server.close(resolve);
  });
});

test('Auth API Tests', async (t) => {
  let superAdminToken = '';
  let schoolAdminToken = '';
  let teacherToken = '';
  let driverToken = '';
  let parentToken = '';

  await t.test('1. Health check returns 200', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'ok');
  });

  await t.test('2. Super Admin Login with email/password', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@busly.test',
        password: 'Password123!',
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.user.role, 'SUPER_ADMIN');
    assert.ok(body.data.token);
    superAdminToken = body.data.token;
  });

  await t.test('3. School Admin Login with email/password', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@abcschool.test',
        password: 'Password123!',
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.user.role, 'SCHOOL_ADMIN');
    assert.strictEqual(body.data.user.schoolCode, 'ABC123');
    assert.ok(body.data.token);
    schoolAdminToken = body.data.token;
  });

  await t.test('4. Reject invalid admin credentials', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@abcschool.test',
        password: 'WrongPassword!',
      }),
    });

    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  await t.test('5. Teacher OTP Request & Verify Flow', async () => {
    // Request OTP
    const reqRes = await fetch(`${baseUrl}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'TEACHER',
        schoolCode: 'ABC123',
        mobile: '9876543210',
      }),
    });

    assert.strictEqual(reqRes.status, 200);
    const reqBody = await reqRes.json();
    assert.strictEqual(reqBody.success, true);
    assert.ok(reqBody.data.sessionId);

    // Verify OTP (using devOtp or 123456)
    const otpToUse = reqBody.data.devOtp || '123456';
    const verifyRes = await fetch(`${baseUrl}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'TEACHER',
        sessionId: reqBody.data.sessionId,
        mobile: '9876543210',
        otp: otpToUse,
      }),
    });

    assert.strictEqual(verifyRes.status, 200);
    const verifyBody = await verifyRes.json();
    assert.strictEqual(verifyBody.success, true);
    assert.strictEqual(verifyBody.data.user.role, 'TEACHER');
    assert.strictEqual(verifyBody.data.user.name, 'Anu Thomas');
    teacherToken = verifyBody.data.token;
  });

  await t.test('6. Driver OTP Request & Verify Flow', async () => {
    // Request OTP
    const reqRes = await fetch(`${baseUrl}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'DRIVER',
        schoolCode: 'ABC123',
        mobile: '9876543211',
      }),
    });

    assert.strictEqual(reqRes.status, 200);
    const reqBody = await reqRes.json();
    const otpToUse = reqBody.data.devOtp || '123456';

    const verifyRes = await fetch(`${baseUrl}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'DRIVER',
        sessionId: reqBody.data.sessionId,
        mobile: '9876543211',
        otp: otpToUse,
      }),
    });

    assert.strictEqual(verifyRes.status, 200);
    const verifyBody = await verifyRes.json();
    assert.strictEqual(verifyBody.success, true);
    assert.strictEqual(verifyBody.data.user.role, 'DRIVER');
    assert.strictEqual(verifyBody.data.user.name, 'Rajesh Kumar');
    driverToken = verifyBody.data.token;
  });

  await t.test('7. Parent OTP Request & Verify Flow with Family Code', async () => {
    // Request OTP for Arun Kumar (FAM7824)
    const reqRes = await fetch(`${baseUrl}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'PARENT',
        schoolCode: 'ABC123',
        familyCode: 'FAM7824',
        mobile: '9876543220',
      }),
    });

    assert.strictEqual(reqRes.status, 200);
    const reqBody = await reqRes.json();
    const otpToUse = reqBody.data.devOtp || '123456';

    const verifyRes = await fetch(`${baseUrl}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'PARENT',
        sessionId: reqBody.data.sessionId,
        mobile: '9876543220',
        otp: otpToUse,
      }),
    });

    assert.strictEqual(verifyRes.status, 200);
    const verifyBody = await verifyRes.json();
    assert.strictEqual(verifyBody.success, true);
    assert.strictEqual(verifyBody.data.user.role, 'PARENT');
    assert.strictEqual(verifyBody.data.user.familyCode, 'FAM7824');
    // Arun Kumar has 2 children: Rahul Kumar and Anu Kumar
    assert.strictEqual(verifyBody.data.user.children.length, 2);
    parentToken = verifyBody.data.token;
  });

  await t.test('8. Parent login rejects incorrect Family Code', async () => {
    const reqRes = await fetch(`${baseUrl}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'PARENT',
        schoolCode: 'ABC123',
        familyCode: 'WRONG_CODE_999',
        mobile: '9876543220',
      }),
    });

    assert.strictEqual(reqRes.status, 404);
  });

  await t.test('9. Verify GET /api/auth/me for authenticated parent', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${parentToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.user.role, 'PARENT');
    assert.strictEqual(body.data.user.familyCode, 'FAM7824');
  });
});
