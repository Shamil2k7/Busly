const test = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

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

test('BUSLY Core Domain Flows & Security Tests', async (t) => {
  let adminToken = '';
  let teacherToken = '';
  let driverToken = '';
  let parentToken = '';
  let generatedFamilyCode = '';
  let newlyCreatedStudentId = '';
  let bus1Id = '';
  let activeTripId = '';

  await t.test('Setup: Authenticate Personas', async () => {
    // School Admin
    const adminRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@abcschool.test', password: 'Password123!' }),
    });
    const adminBody = await adminRes.json();
    assert.strictEqual(adminRes.status, 200);
    adminToken = adminBody.data.token;

    // Teacher
    const tOtpRes = await fetch(`${baseUrl}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'TEACHER', schoolCode: 'ABC123', mobile: '9876543210' }),
    });
    const tOtpBody = await tOtpRes.json();
    const tVerifyRes = await fetch(`${baseUrl}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'TEACHER',
        sessionId: tOtpBody.data.sessionId,
        mobile: '9876543210',
        otp: tOtpBody.data.devOtp || '123456',
      }),
    });
    const tVerifyBody = await tVerifyRes.json();
    teacherToken = tVerifyBody.data.token;

    // Driver
    const dOtpRes = await fetch(`${baseUrl}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'DRIVER', schoolCode: 'ABC123', mobile: '9876543211' }),
    });
    const dOtpBody = await dOtpRes.json();
    const dVerifyRes = await fetch(`${baseUrl}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'DRIVER',
        sessionId: dOtpBody.data.sessionId,
        mobile: '9876543211',
        otp: dOtpBody.data.devOtp || '123456',
      }),
    });
    const dVerifyBody = await dVerifyRes.json();
    driverToken = dVerifyBody.data.token;

    // Parent (Arun Kumar - FAM7824)
    const pOtpRes = await fetch(`${baseUrl}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'PARENT', schoolCode: 'ABC123', familyCode: 'FAM7824', mobile: '9876543220' }),
    });
    const pOtpBody = await pOtpRes.json();
    const pVerifyRes = await fetch(`${baseUrl}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'PARENT',
        sessionId: pOtpBody.data.sessionId,
        mobile: '9876543220',
        otp: pOtpBody.data.devOtp || '123456',
      }),
    });
    const pVerifyBody = await pVerifyRes.json();
    parentToken = pVerifyBody.data.token;

    // Fetch Bus 01 ID
    const busesRes = await fetch(`${baseUrl}/api/buses`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const busesBody = await busesRes.json();
    const bus1 = busesBody.data.find((b) => b.busNumber === 'BUS 01');
    assert.ok(bus1);
    bus1Id = bus1.id;
  });

  let testParentMobile = `98765${Math.floor(10000 + Math.random() * 90000)}`;

  await t.test('Flow 1: Teacher Add Student Workflow with Family Code Generation', async () => {
    // Unique studentId per test run to prevent collision
    const testStudentId = `STU-FLOW-${Date.now().toString().slice(-4)}`;
    const studentPayload = {
      name: 'Kavya Nair',
      studentId: testStudentId,
      class: '7',
      division: 'B',
      parentName: 'Ramesh Nair',
      parentMobile: testParentMobile,
      parentEmail: 'ramesh.nair@parent.test',
      relationship: 'FATHER',
      busId: bus1Id,
    };

    const res = await fetch(`${baseUrl}/api/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken}`,
      },
      body: JSON.stringify(studentPayload),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.familyCode.startsWith('FAM'));
    generatedFamilyCode = body.data.familyCode;
    newlyCreatedStudentId = body.data.student.id;
  });

  await t.test('Flow 2: Newly Created Student Parent Can Immediately Login with Generated Family Code', async () => {
    // Request OTP for new parent Ramesh Nair with new family code
    const reqRes = await fetch(`${baseUrl}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'PARENT',
        schoolCode: 'ABC123',
        familyCode: generatedFamilyCode,
        mobile: testParentMobile,
      }),
    });

    assert.strictEqual(reqRes.status, 200);
    const reqBody = await reqRes.json();
    assert.ok(reqBody.data.sessionId);

    // Verify OTP
    const verifyRes = await fetch(`${baseUrl}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'PARENT',
        sessionId: reqBody.data.sessionId,
        mobile: testParentMobile,
        otp: reqBody.data.devOtp || '123456',
      }),
    });

    assert.strictEqual(verifyRes.status, 200);
    const verifyBody = await verifyRes.json();
    assert.strictEqual(verifyBody.data.user.name, 'Ramesh Nair');
    assert.strictEqual(verifyBody.data.user.children.length, 1);
    assert.strictEqual(verifyBody.data.user.children[0].name, 'Kavya Nair');
  });

  await t.test('Flow 3: Tenant Isolation & Parent Cross-Family Protection', async () => {
    // Parent Arun Kumar (FAM7824) tries to access Kavya Nair (Ramesh Nair FAMxxxx)
    const res = await fetch(`${baseUrl}/api/students/${newlyCreatedStudentId}`, {
      headers: { Authorization: `Bearer ${parentToken}` },
    });

    // Must be blocked!
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  await t.test('Flow 4: Trip Lifecycle & Student Pickup/Drop Update', async () => {
    // 1. School Admin schedules a trip
    const routesRes = await fetch(`${baseUrl}/api/routes`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const routesBody = await routesRes.json();
    const route = routesBody.data[0];

    const createTripRes = await fetch(`${baseUrl}/api/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        busId: bus1Id,
        routeId: route.id,
        type: 'AFTERNOON',
      }),
    });

    assert.strictEqual(createTripRes.status, 201);
    const createTripBody = await createTripRes.json();
    activeTripId = createTripBody.data.id;
    assert.strictEqual(createTripBody.data.status, 'SCHEDULED');

    // 2. Driver starts trip
    const startRes = await fetch(`${baseUrl}/api/trips/${activeTripId}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${driverToken}` },
    });
    assert.strictEqual(startRes.status, 200);
    const startBody = await startRes.json();
    assert.strictEqual(startBody.data.status, 'ACTIVE');

    // 3. Mark student status
    const statusRes = await fetch(`${baseUrl}/api/trips/${activeTripId}/student-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${driverToken}`,
      },
      body: JSON.stringify({
        studentId: newlyCreatedStudentId,
        status: 'DROPPED_OFF',
      }),
    });
    assert.strictEqual(statusRes.status, 200);

    // 4. End trip
    const endRes = await fetch(`${baseUrl}/api/trips/${activeTripId}/end`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${driverToken}` },
    });
    assert.strictEqual(endRes.status, 200);
    const endBody = await endRes.json();
    assert.strictEqual(endBody.data.status, 'COMPLETED');
  });

  await t.test('Flow 5: Bus Fee Checkout & Mock Payment Flow with Receipt', async () => {
    // 1. Fetch pending fees for Parent Arun Kumar
    const feesRes = await fetch(`${baseUrl}/api/fees/students?status=PENDING`, {
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    assert.strictEqual(feesRes.status, 200);
    const feesBody = await feesRes.json();
    let pendingFee = feesBody.data[0];
    if (!pendingFee) {
      // Find Rahul Kumar's student record
      const stuRes = await fetch(`${baseUrl}/api/students?search=Rahul`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const stuBody = await stuRes.json();
      const rahul = stuBody.data[0];

      // Get fee plan
      const plansRes = await fetch(`${baseUrl}/api/fees/plans`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const plansBody = await plansRes.json();
      const plan = plansBody.data[0];

      // Assign new fee
      const assignRes = await fetch(`${baseUrl}/api/fees/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          feePlanId: plan.id,
          billingPeriodLabel: `Term-${Date.now()}`,
          targetType: 'SELECTED',
          studentIds: [rahul.id],
        }),
      });
      assert.strictEqual(assignRes.status, 200);

      // Refetch pending fees for parent
      const refetchFees = await fetch(`${baseUrl}/api/fees/students?status=PENDING`, {
        headers: { Authorization: `Bearer ${parentToken}` },
      });
      const refetchBody = await refetchFees.json();
      pendingFee = refetchBody.data[0];
    }
    assert.ok(pendingFee);

    // 2. Create checkout intent
    const intentRes = await fetch(`${baseUrl}/api/payments/checkout-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${parentToken}`,
      },
      body: JSON.stringify({
        studentFeeId: pendingFee.id,
        paymentMethod: 'UPI',
      }),
    });
    assert.strictEqual(intentRes.status, 200);
    const intentBody = await intentRes.json();
    assert.ok(intentBody.data.orderId);

    // 3. Process payment
    const processRes = await fetch(`${baseUrl}/api/payments/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${parentToken}`,
      },
      body: JSON.stringify({
        studentFeeId: pendingFee.id,
        paymentMethod: 'UPI',
      }),
    });
    assert.strictEqual(processRes.status, 201);
    const processBody = await processRes.json();
    assert.strictEqual(processBody.data.status, 'SUCCESS');
    assert.ok(processBody.data.receiptNumber.startsWith('RCP-'));

    // 4. Download / View receipt
    const receiptRes = await fetch(`${baseUrl}/api/payments/${processBody.data.receiptNumber}/receipt`, {
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    assert.strictEqual(receiptRes.status, 200);
    const receiptBody = await receiptRes.json();
    assert.strictEqual(receiptBody.data.receiptNumber, processBody.data.receiptNumber);
    assert.strictEqual(receiptBody.data.amount, pendingFee.totalAmount);
  });

  await t.test('Flow 6: Driver SOS Alert & Admin Acknowledge / Resolve', async () => {
    // 1. Driver triggers SOS
    const sosRes = await fetch(`${baseUrl}/api/emergency/sos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${driverToken}`,
      },
      body: JSON.stringify({
        busId: bus1Id,
        latitude: 11.2789,
        longitude: 76.2291,
        reason: 'Flat tire near Market Junction',
      }),
    });

    assert.strictEqual(sosRes.status, 201);
    const sosBody = await sosRes.json();
    assert.strictEqual(sosBody.data.status, 'ACTIVE');
    const alertId = sosBody.data.id;

    // 2. School Admin lists alerts
    const listRes = await fetch(`${baseUrl}/api/emergency?status=ACTIVE`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(listRes.status, 200);
    const listBody = await listRes.json();
    const alert = listBody.data.find((a) => a.id === alertId);
    assert.ok(alert);

    // 3. Admin Acknowledges alert
    const ackRes = await fetch(`${baseUrl}/api/emergency/${alertId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'ACKNOWLEDGED' }),
    });
    assert.strictEqual(ackRes.status, 200);

    // 4. Admin Resolves alert
    const resolveRes = await fetch(`${baseUrl}/api/emergency/${alertId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'RESOLVED' }),
    });
    assert.strictEqual(resolveRes.status, 200);
    const resolveBody = await resolveRes.json();
    assert.strictEqual(resolveBody.data.status, 'RESOLVED');
  });

  await t.test('Flow 7: Role Dashboard Metrics API verification', async () => {
    // School Admin dashboard
    const adminDashRes = await fetch(`${baseUrl}/api/reports/dashboard/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(adminDashRes.status, 200);
    const adminDashBody = await adminDashRes.json();
    assert.ok(adminDashBody.data.metrics.totalStudents >= 3);
    assert.ok(adminDashBody.data.metrics.activeBuses >= 2);

    // Parent dashboard
    const parentDashRes = await fetch(`${baseUrl}/api/reports/dashboard/parent`, {
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    assert.strictEqual(parentDashRes.status, 200);
    const parentDashBody = await parentDashRes.json();
    assert.strictEqual(parentDashBody.data.familyCode, 'FAM7824');
    assert.strictEqual(parentDashBody.data.children.length, 2);
  });
});
