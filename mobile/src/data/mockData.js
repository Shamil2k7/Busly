// Standard Demo & Fallback Data matching Busly Backend Seed

export const DEMO_SCHOOL = {
  id: 'school-abc-123',
  name: 'ABC Public School',
  code: 'ABC123',
  phone: '+91 94470 12345',
  address: 'Civil Station Road, Nilambur, Kerala 679329',
};

export const DEMO_TEACHER_USER = {
  id: 'teacher-user-1',
  teacherId: 'teacher-1',
  name: 'Anu Thomas',
  mobile: '9876543210',
  role: 'TEACHER',
  schoolId: 'school-abc-123',
  schoolName: 'ABC Public School',
  schoolCode: 'ABC123',
  employeeId: 'TCH-001',
  assignedClasses: '10-A, 10-B',
};

export const DEMO_PARENT_USER = {
  id: 'parent-1',
  parentId: 'parent-1',
  name: 'Arun Kumar',
  mobile: '9876543220',
  role: 'PARENT',
  schoolId: 'school-abc-123',
  schoolName: 'ABC Public School',
  schoolCode: 'ABC123',
  familyId: 'family-7824',
  familyCode: 'FAM7824',
  children: [
    {
      id: 'student-1',
      studentId: 'STU-101',
      name: 'Rahul Kumar',
      class: '10',
      division: 'A',
      busNumber: 'BUS 01',
      busRegistration: 'KL-10-AZ-1001',
      busId: 'bus-1',
      driverName: 'Rajesh Kumar',
      driverMobile: '+91 98765 43211',
      pickupStopName: 'Nilambur Junction',
      pickupTime: '07:35 AM',
      dropStopName: 'Nilambur Junction',
      dropTime: '04:15 PM',
      currentStatus: 'ON_BUS', // WAITING, PICKED_UP, ON_BUS, DROPPED_OFF, ABSENT
    },
    {
      id: 'student-2',
      studentId: 'STU-102',
      name: 'Anu Kumar',
      class: '7',
      division: 'B',
      busNumber: 'BUS 02',
      busRegistration: 'KL-10-AZ-1002',
      busId: 'bus-2',
      driverName: 'Suresh Babu',
      driverMobile: '+91 98765 43212',
      pickupStopName: 'Town Church Stop',
      pickupTime: '07:20 AM',
      dropStopName: 'Town Church Stop',
      dropTime: '04:30 PM',
      currentStatus: 'DROPPED_OFF',
    },
  ],
};

export const DEMO_DRIVER_USER = {
  id: 'driver-user-1',
  driverId: 'driver-1',
  name: 'Rajesh Kumar',
  mobile: '9876543211',
  role: 'DRIVER',
  schoolId: 'school-abc-123',
  schoolName: 'ABC Public School',
  schoolCode: 'ABC123',
  licenseNumber: 'KL-10-2015-00892',
  assignedBus: {
    id: 'bus-1',
    busNumber: 'BUS 01',
    registrationNumber: 'KL-10-AZ-1001',
    capacity: 32,
    route: {
      id: 'route-1',
      name: 'Nilambur Main Route',
    },
  },
};

export const INITIAL_ROUTE_STOPS = [
  { id: 'stop-1', name: 'School Main Campus', sequence: 1, eta: '07:00 AM', lat: 11.2750, lng: 76.2220, count: 0 },
  { id: 'stop-2', name: 'Town Church Junction', sequence: 2, eta: '07:15 AM', lat: 11.2810, lng: 76.2300, count: 4 },
  { id: 'stop-3', name: 'Central Hospital Stop', sequence: 3, eta: '07:25 AM', lat: 11.2865, lng: 76.2370, count: 6 },
  { id: 'stop-4', name: 'Nilambur Junction (Main)', sequence: 4, eta: '07:35 AM', lat: 11.2920, lng: 76.2440, count: 8 },
  { id: 'stop-5', name: 'Green Valley Villas', sequence: 5, eta: '07:45 AM', lat: 11.2980, lng: 76.2510, count: 4 },
];

export const INITIAL_STUDENTS_MANIFEST = [
  { id: 'st-1', name: 'Rahul Kumar', studentId: 'STU-101', class: '10-A', stop: 'Nilambur Junction', stopId: 'stop-4', parentName: 'Arun Kumar', parentMobile: '9876543220', status: 'ON_BUS' },
  { id: 'st-2', name: 'Sneha Menon', studentId: 'STU-103', class: '10-A', stop: 'Nilambur Junction', stopId: 'stop-4', parentName: 'Girish Menon', parentMobile: '9876543221', status: 'ON_BUS' },
  { id: 'st-3', name: 'Devanand R.', studentId: 'STU-104', class: '10-B', stop: 'Town Church Junction', stopId: 'stop-2', parentName: 'Radhika R.', parentMobile: '9876543222', status: 'DROPPED_OFF' },
  { id: 'st-4', name: 'Fatima Zahra', studentId: 'STU-105', class: '10-A', stop: 'Central Hospital Stop', stopId: 'stop-3', parentName: 'Zahir Khan', parentMobile: '9876543223', status: 'WAITING' },
  { id: 'st-5', name: 'Abhinav Nair', studentId: 'STU-106', class: '10-B', stop: 'Green Valley Villas', stopId: 'stop-5', parentName: 'Narayanan N.', parentMobile: '9876543224', status: 'WAITING' },
  { id: 'st-6', name: 'Meera Joseph', studentId: 'STU-107', class: '10-A', stop: 'Central Hospital Stop', stopId: 'stop-3', parentName: 'Joseph K.', parentMobile: '9876543225', status: 'ABSENT' },
  { id: 'st-7', name: 'Karthik Varma', studentId: 'STU-108', class: '10-B', stop: 'Nilambur Junction', stopId: 'stop-4', parentName: 'Varma S.', parentMobile: '9876543226', status: 'ON_BUS' },
];

export const DEMO_FEES = [
  {
    id: 'fee-1',
    studentName: 'Rahul Kumar',
    studentId: 'STU-101',
    billingPeriod: 'October 2026',
    baseAmount: 1800,
    lateFee: 0,
    discount: 100,
    totalAmount: 1700,
    status: 'PENDING',
    dueDate: '2026-10-25',
    feePlanName: 'Standard Annual Bus Fee',
  },
  {
    id: 'fee-2',
    studentName: 'Anu Kumar',
    studentId: 'STU-102',
    billingPeriod: 'October 2026',
    baseAmount: 1600,
    lateFee: 0,
    discount: 100,
    totalAmount: 1500,
    status: 'PAID',
    paidAt: '2026-10-05',
    receiptNumber: 'RCP-2026-8812',
    dueDate: '2026-10-25',
    feePlanName: 'Junior Transport Plan',
  },
];

export const DEMO_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Bus Arrived at Stop',
    message: 'BUS 01 has arrived at Nilambur Central.',
    type: 'ALERT',
    createdAt: new Date().toISOString(),
    isRead: false,
  },
  {
    id: 'notif-2',
    title: 'Trip Started',
    message: 'Morning trip for BUS 01 has started.',
    type: 'INFO',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isRead: true,
  },
];

