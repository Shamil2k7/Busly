const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Busly database...');

  // 1. Create Super Admin
  const superAdminPassword = await bcrypt.hash('Password123!', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@busly.test' },
    update: {},
    create: {
      name: 'Busly Super Admin',
      email: 'superadmin@busly.test',
      passwordHash: superAdminPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('Super Admin ready:', superAdmin.email);

  // 2. Create School: ABC Public School (ABC123)
  const school = await prisma.school.upsert({
    where: { code: 'ABC123' },
    update: {},
    create: {
      name: 'ABC Public School',
      code: 'ABC123',
      address: 'Main Campus Road, Nilambur, Kerala',
      phone: '+91 4931 220011',
      email: 'office@abcschool.test',
      status: 'ACTIVE',
      subscriptionPlan: 'PRO',
    },
  });
  console.log('School ready:', school.name, `(${school.code})`);

  // 3. Create School Admin
  const schoolAdminPassword = await bcrypt.hash('Password123!', 10);
  const schoolAdmin = await prisma.user.upsert({
    where: { email: 'admin@abcschool.test' },
    update: { schoolId: school.id },
    create: {
      schoolId: school.id,
      name: 'School Principal & Transport Admin',
      email: 'admin@abcschool.test',
      passwordHash: schoolAdminPassword,
      role: 'SCHOOL_ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('School Admin ready:', schoolAdmin.email);

  // 4. Create Teachers: Anu Thomas
  const teacherUser = await prisma.user.upsert({
    where: { email: 'anu.thomas@abcschool.test' },
    update: { schoolId: school.id },
    create: {
      schoolId: school.id,
      name: 'Anu Thomas',
      email: 'anu.thomas@abcschool.test',
      mobile: '9876543210',
      role: 'TEACHER',
      status: 'ACTIVE',
    },
  });

  const teacher = await prisma.teacher.upsert({
    where: {
      schoolId_employeeId: {
        schoolId: school.id,
        employeeId: 'TCH-001',
      },
    },
    update: {},
    create: {
      schoolId: school.id,
      userId: teacherUser.id,
      name: 'Anu Thomas',
      mobile: '9876543210',
      email: 'anu.thomas@abcschool.test',
      employeeId: 'TCH-001',
      assignedClasses: '10-A, 10-B, 9-A',
      status: 'ACTIVE',
    },
  });
  console.log('Teacher ready:', teacher.name);

  // 5. Create Drivers: Rajesh Kumar, Vishnu Kumar
  const driverUser1 = await prisma.user.upsert({
    where: { email: 'rajesh.kumar@abcschool.test' },
    update: { schoolId: school.id },
    create: {
      schoolId: school.id,
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@abcschool.test',
      mobile: '9876543211',
      role: 'DRIVER',
      status: 'ACTIVE',
    },
  });

  const driver1 = await prisma.driver.upsert({
    where: {
      schoolId_licenseNumber: {
        schoolId: school.id,
        licenseNumber: 'DL-KL-10-2015-001',
      },
    },
    update: {},
    create: {
      schoolId: school.id,
      userId: driverUser1.id,
      name: 'Rajesh Kumar',
      mobile: '9876543211',
      licenseNumber: 'DL-KL-10-2015-001',
      status: 'ACTIVE',
    },
  });

  const driverUser2 = await prisma.user.upsert({
    where: { email: 'vishnu.kumar@abcschool.test' },
    update: { schoolId: school.id },
    create: {
      schoolId: school.id,
      name: 'Vishnu Kumar',
      email: 'vishnu.kumar@abcschool.test',
      mobile: '9876543212',
      role: 'DRIVER',
      status: 'ACTIVE',
    },
  });

  const driver2 = await prisma.driver.upsert({
    where: {
      schoolId_licenseNumber: {
        schoolId: school.id,
        licenseNumber: 'DL-KL-10-2018-002',
      },
    },
    update: {},
    create: {
      schoolId: school.id,
      userId: driverUser2.id,
      name: 'Vishnu Kumar',
      mobile: '9876543212',
      licenseNumber: 'DL-KL-10-2018-002',
      status: 'ACTIVE',
    },
  });
  console.log('Drivers ready:', driver1.name, ',', driver2.name);

  // 6. Create Routes & Stops
  // Nilambur Route
  let route1 = await prisma.route.findFirst({
    where: { schoolId: school.id, name: 'Nilambur Route' },
  });
  if (!route1) {
    route1 = await prisma.route.create({
      data: {
        schoolId: school.id,
        name: 'Nilambur Route',
        status: 'ACTIVE',
      },
    });
  }

  // Town Route
  let route2 = await prisma.route.findFirst({
    where: { schoolId: school.id, name: 'Town Route' },
  });
  if (!route2) {
    route2 = await prisma.route.create({
      data: {
        schoolId: school.id,
        name: 'Town Route',
        status: 'ACTIVE',
      },
    });
  }

  // Stops for Nilambur Route
  const stopsData1 = [
    { name: 'Nilambur Central', latitude: 11.2778, longitude: 76.2268, sequence: 1, estimatedArrival: '07:30 AM' },
    { name: 'Main Road Junction', latitude: 11.2825, longitude: 76.2341, sequence: 2, estimatedArrival: '07:45 AM' },
    { name: 'Market Junction', latitude: 11.2890, longitude: 76.2415, sequence: 3, estimatedArrival: '08:00 AM' },
    { name: 'ABC Public School Gate', latitude: 11.2950, longitude: 76.2500, sequence: 4, estimatedArrival: '08:20 AM' },
  ];

  for (const s of stopsData1) {
    const existing = await prisma.stop.findFirst({
      where: { routeId: route1.id, name: s.name },
    });
    if (!existing) {
      await prisma.stop.create({
        data: {
          routeId: route1.id,
          name: s.name,
          latitude: s.latitude,
          longitude: s.longitude,
          sequence: s.sequence,
          estimatedArrival: s.estimatedArrival,
        },
      });
    }
  }

  // Stops for Town Route
  const stopsData2 = [
    { name: 'Town Bus Terminal', latitude: 11.2650, longitude: 76.2100, sequence: 1, estimatedArrival: '07:35 AM' },
    { name: 'Civil Station Stop', latitude: 11.2720, longitude: 76.2190, sequence: 2, estimatedArrival: '07:50 AM' },
    { name: 'ABC Public School Gate', latitude: 11.2950, longitude: 76.2500, sequence: 3, estimatedArrival: '08:15 AM' },
  ];

  for (const s of stopsData2) {
    const existing = await prisma.stop.findFirst({
      where: { routeId: route2.id, name: s.name },
    });
    if (!existing) {
      await prisma.stop.create({
        data: {
          routeId: route2.id,
          name: s.name,
          latitude: s.latitude,
          longitude: s.longitude,
          sequence: s.sequence,
          estimatedArrival: s.estimatedArrival,
        },
      });
    }
  }

  // 7. Create Buses: BUS 01, BUS 02
  const bus1 = await prisma.bus.upsert({
    where: {
      schoolId_busNumber: {
        schoolId: school.id,
        busNumber: 'BUS 01',
      },
    },
    update: {
      driverId: driver1.id,
      routeId: route1.id,
    },
    create: {
      schoolId: school.id,
      busNumber: 'BUS 01',
      registrationNumber: 'KL-10-AZ-1001',
      capacity: 35,
      driverId: driver1.id,
      routeId: route1.id,
      status: 'ACTIVE',
    },
  });

  const bus2 = await prisma.bus.upsert({
    where: {
      schoolId_busNumber: {
        schoolId: school.id,
        busNumber: 'BUS 02',
      },
    },
    update: {
      driverId: driver2.id,
      routeId: route2.id,
    },
    create: {
      schoolId: school.id,
      busNumber: 'BUS 02',
      registrationNumber: 'KL-10-AZ-2002',
      capacity: 30,
      driverId: driver2.id,
      routeId: route2.id,
      status: 'ACTIVE',
    },
  });
  console.log('Buses ready:', bus1.busNumber, ',', bus2.busNumber);

  // 8. Create Fee Plans
  const feePlanStandard = await prisma.feePlan.upsert({
    where: { id: 'fee-plan-standard' },
    update: {},
    create: {
      id: 'fee-plan-standard',
      schoolId: school.id,
      name: 'Standard Monthly Bus Fee',
      amount: 1500,
      billingPeriod: 'MONTHLY',
      dueDay: 10,
      lateFee: 50,
      status: 'ACTIVE',
    },
  });

  const feePlanQuarterly = await prisma.feePlan.upsert({
    where: { id: 'fee-plan-quarterly' },
    update: {},
    create: {
      id: 'fee-plan-quarterly',
      schoolId: school.id,
      name: 'Quarterly Bus Transport Pass',
      amount: 4200,
      billingPeriod: 'QUARTERLY',
      dueDay: 15,
      lateFee: 100,
      status: 'ACTIVE',
    },
  });
  console.log('Fee Plans ready:', feePlanStandard.name);

  // 9. Create Families & Parents
  // Family 1: FAM7824 (Parent: Arun Kumar)
  const family1 = await prisma.family.upsert({
    where: {
      schoolId_familyCode: {
        schoolId: school.id,
        familyCode: 'FAM7824',
      },
    },
    update: {},
    create: {
      schoolId: school.id,
      familyCode: 'FAM7824',
      status: 'ACTIVE',
    },
  });

  await prisma.parent.upsert({
    where: {
      schoolId_mobile: {
        schoolId: school.id,
        mobile: '9876543220',
      },
    },
    update: {},
    create: {
      schoolId: school.id,
      familyId: family1.id,
      name: 'Arun Kumar',
      relationship: 'FATHER',
      mobile: '9876543220',
      email: 'arun.kumar@parent.test',
      status: 'ACTIVE',
    },
  });

  // Family 2: FAM7825 (Parent: Suresh Kumar)
  const family2 = await prisma.family.upsert({
    where: {
      schoolId_familyCode: {
        schoolId: school.id,
        familyCode: 'FAM7825',
      },
    },
    update: {},
    create: {
      schoolId: school.id,
      familyCode: 'FAM7825',
      status: 'ACTIVE',
    },
  });

  await prisma.parent.upsert({
    where: {
      schoolId_mobile: {
        schoolId: school.id,
        mobile: '9876543221',
      },
    },
    update: {},
    create: {
      schoolId: school.id,
      familyId: family2.id,
      name: 'Suresh Kumar',
      relationship: 'FATHER',
      mobile: '9876543221',
      email: 'suresh.kumar@parent.test',
      status: 'ACTIVE',
    },
  });
  console.log('Families & Parents ready: FAM7824, FAM7825');

  // Fetch stops for assignment
  const nilamburStop = await prisma.stop.findFirst({ where: { routeId: route1.id, sequence: 1 } });
  const marketStop = await prisma.stop.findFirst({ where: { routeId: route1.id, sequence: 3 } });
  const schoolStop1 = await prisma.stop.findFirst({ where: { routeId: route1.id, sequence: 4 } });

  const townStop = await prisma.stop.findFirst({ where: { routeId: route2.id, sequence: 1 } });
  const schoolStop2 = await prisma.stop.findFirst({ where: { routeId: route2.id, sequence: 3 } });

  // 10. Create Students
  // Rahul Kumar (FAM7824, Bus 01)
  const student1 = await prisma.student.upsert({
    where: {
      schoolId_studentId: {
        schoolId: school.id,
        studentId: 'STU-001',
      },
    },
    update: {},
    create: {
      schoolId: school.id,
      studentId: 'STU-001',
      name: 'Rahul Kumar',
      class: '10',
      division: 'A',
      familyId: family1.id,
      busId: bus1.id,
      pickupStopId: nilamburStop?.id,
      dropStopId: nilamburStop?.id,
      feePlanId: feePlanStandard.id,
      status: 'ACTIVE',
    },
  });

  // Anu Kumar (FAM7824, Bus 02)
  const student2 = await prisma.student.upsert({
    where: {
      schoolId_studentId: {
        schoolId: school.id,
        studentId: 'STU-002',
      },
    },
    update: {},
    create: {
      schoolId: school.id,
      studentId: 'STU-002',
      name: 'Anu Kumar',
      class: '6',
      division: 'B',
      familyId: family1.id,
      busId: bus2.id,
      pickupStopId: townStop?.id,
      dropStopId: townStop?.id,
      feePlanId: feePlanStandard.id,
      status: 'ACTIVE',
    },
  });

  // Akhil Kumar (FAM7825, Bus 01)
  const student3 = await prisma.student.upsert({
    where: {
      schoolId_studentId: {
        schoolId: school.id,
        studentId: 'STU-003',
      },
    },
    update: {},
    create: {
      schoolId: school.id,
      studentId: 'STU-003',
      name: 'Akhil Kumar',
      class: '8',
      division: 'A',
      familyId: family2.id,
      busId: bus1.id,
      pickupStopId: marketStop?.id,
      dropStopId: marketStop?.id,
      feePlanId: feePlanStandard.id,
      status: 'ACTIVE',
    },
  });
  console.log('Students ready: Rahul Kumar, Anu Kumar, Akhil Kumar');

  // 11. Create Student Fees & Sample Payments
  const fee1 = await prisma.studentFee.upsert({
    where: { id: 'fee-rahul-oct2026' },
    update: {},
    create: {
      id: 'fee-rahul-oct2026',
      schoolId: school.id,
      studentId: student1.id,
      feePlanId: feePlanStandard.id,
      familyId: family1.id,
      billingPeriodLabel: 'October 2026',
      baseAmount: 1500,
      discount: 0,
      lateFee: 0,
      totalAmount: 1500,
      status: 'PAID',
      dueDate: new Date(Date.now() + 10 * 86400000),
    },
  });

  await prisma.payment.upsert({
    where: { paymentReference: 'PAY-BUSLY-7824-001' },
    update: {},
    create: {
      schoolId: school.id,
      familyId: family1.id,
      studentId: student1.id,
      studentFeeId: fee1.id,
      amount: 1500,
      paymentReference: 'PAY-BUSLY-7824-001',
      paymentMethod: 'UPI',
      status: 'SUCCESS',
      paidAt: new Date(),
      receiptNumber: 'RCP-2026-0001',
      metadata: JSON.stringify({ upiId: 'arun@okhdfc', txnId: 'TXN998811' }),
    },
  });

  // Pending fee for Anu Kumar
  await prisma.studentFee.upsert({
    where: { id: 'fee-anu-oct2026' },
    update: {},
    create: {
      id: 'fee-anu-oct2026',
      schoolId: school.id,
      studentId: student2.id,
      feePlanId: feePlanStandard.id,
      familyId: family1.id,
      billingPeriodLabel: 'October 2026',
      baseAmount: 1500,
      discount: 100, // sibling discount
      lateFee: 0,
      totalAmount: 1400,
      status: 'PENDING',
      dueDate: new Date(Date.now() + 5 * 86400000),
    },
  });

  // Pending fee for Akhil Kumar
  await prisma.studentFee.upsert({
    where: { id: 'fee-akhil-oct2026' },
    update: {},
    create: {
      id: 'fee-akhil-oct2026',
      schoolId: school.id,
      studentId: student3.id,
      feePlanId: feePlanStandard.id,
      familyId: family2.id,
      billingPeriodLabel: 'October 2026',
      baseAmount: 1500,
      discount: 0,
      lateFee: 0,
      totalAmount: 1500,
      status: 'PENDING',
      dueDate: new Date(Date.now() + 7 * 86400000),
    },
  });
  console.log('Fees and sample payment receipt created.');

  // 12. Create a Morning Trip for Today
  const todayMorningTrip = await prisma.trip.create({
    data: {
      schoolId: school.id,
      busId: bus1.id,
      driverId: driver1.id,
      routeId: route1.id,
      type: 'MORNING',
      scheduledStart: new Date(),
      actualStart: new Date(),
      status: 'ACTIVE',
      currentStopId: nilamburStop?.id,
    },
  });

  // Trip student statuses
  await prisma.studentTripStatus.createMany({
    data: [
      {
        tripId: todayMorningTrip.id,
        studentId: student1.id,
        status: 'PICKED_UP',
        stopId: nilamburStop?.id,
        markedAt: new Date(),
      },
      {
        tripId: todayMorningTrip.id,
        studentId: student3.id,
        status: 'WAITING',
        stopId: marketStop?.id,
      },
    ],
  });

  // Initial Bus Location
  await prisma.busLocationLog.create({
    data: {
      busId: bus1.id,
      tripId: todayMorningTrip.id,
      latitude: 11.2785,
      longitude: 76.2280,
      speed: 35.5,
      heading: 45.0,
    },
  });

  // Sample Announcements / Notifications
  await prisma.notification.createMany({
    data: [
      {
        schoolId: school.id,
        recipientRole: 'PARENT',
        familyId: family1.id,
        title: 'Morning Route Started',
        message: 'BUS 01 has started its morning trip on Nilambur Route.',
        type: 'BUS_STARTED',
      },
      {
        schoolId: school.id,
        recipientRole: 'PARENT',
        familyId: family1.id,
        title: 'Student Picked Up',
        message: 'Rahul Kumar was picked up at Nilambur Central.',
        type: 'STUDENT_PICKED_UP',
      },
      {
        schoolId: school.id,
        recipientRole: 'ALL',
        title: 'Welcome to Busly Transport System',
        message: 'ABC Public School transport tracking is now live.',
        type: 'SCHOOL_ANNOUNCEMENT',
      },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
