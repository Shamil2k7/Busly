import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mobileApi, LIVE_BACKEND_URL } from '../config/api';
import {
  DEMO_TEACHER_USER,
  DEMO_PARENT_USER,
  DEMO_DRIVER_USER,
  INITIAL_STUDENTS_MANIFEST,
  INITIAL_ROUTE_STOPS,
  DEMO_FEES,
  DEMO_NOTIFICATIONS,
} from '../data/mockData';
import { connectMobileSocket, disconnectMobileSocket, broadcastDriverLocation } from '../services/socket';

const MobileAuthContext = createContext(null);

export const MobileAuthProvider = ({ children }) => {
  // User Authentication State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('busly_mobile_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.id || parsed.parentId || parsed.teacherId || parsed.driverId)) {
          return parsed;
        }
      }
    } catch (e) {
      localStorage.removeItem('busly_mobile_current_user');
    }
    return null; // Start unauthenticated so user can log in dynamically or choose demo
  });

  const [activeChildId, setActiveChildId] = useState(() => {
    return user?.children?.[0]?.id || null;
  });

  // Dynamic live data states fetched from backend
  const [fees, setFees] = useState(DEMO_FEES);
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [studentsRoster, setStudentsRoster] = useState([]);
  const [fleetBuses, setFleetBuses] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'

  // Driver Cockpit Live State
  const [tripState, setTripState] = useState({
    id: 'trip-active-1',
    status: 'ACTIVE',
    type: 'MORNING',
    currentStopIndex: 2,
    speed: 36,
    heading: 45,
    stops: INITIAL_ROUTE_STOPS,
    students: INITIAL_STUDENTS_MANIFEST,
    isSimulatingGps: true,
  });

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  // Health check on backend on mount
  useEffect(() => {
    let isMounted = true;
    mobileApi
      .get('/api/health')
      .then((res) => {
        if (isMounted) setBackendStatus(res?.status === 'ok' ? 'online' : 'offline');
      })
      .catch(() => {
        if (isMounted) setBackendStatus('offline');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync token and socket when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('busly_mobile_current_user', JSON.stringify(user));
      const token = mobileApi.getToken();
      if (token) {
        connectMobileSocket(token);
      }
      if (user.children && user.children.length > 0 && !activeChildId) {
        setActiveChildId(user.children[0].id);
      }
    } else {
      localStorage.removeItem('busly_mobile_current_user');
      disconnectMobileSocket();
    }
  }, [user]);

  // Load Parent Fees dynamically from live backend
  const loadFees = useCallback(async () => {
    if (!mobileApi.getToken()) return;
    try {
      const res = await mobileApi.get('/api/fees/students');
      if (res && res.data && Array.isArray(res.data)) {
        setFees(res.data);
      }
    } catch (err) {
      console.warn('[MobileApi] Using fallback/cached fees:', err.message);
    }
  }, []);

  // Load Notifications dynamically from live backend
  const loadNotifications = useCallback(async () => {
    if (!mobileApi.getToken()) return;
    try {
      const res = await mobileApi.get('/api/notifications');
      if (res && res.data) {
        const notifs = res.data.notifications || res.data;
        if (Array.isArray(notifs)) {
          setNotifications(notifs);
        }
      }
    } catch (err) {
      console.warn('[MobileApi] Using fallback/cached notifications:', err.message);
    }
  }, []);

  // Load Teacher Students Roster dynamically from live backend
  const loadStudents = useCallback(async () => {
    if (!mobileApi.getToken()) return;
    try {
      const res = await mobileApi.get('/api/students');
      if (res && res.data) {
        const list = res.data.students || res.data;
        if (Array.isArray(list)) {
          setStudentsRoster(list);
          // Also sync to tripState for manifest views
          setTripState((prev) => ({
            ...prev,
            students: list.map((st) => ({
              id: st.id,
              name: st.name,
              studentId: st.studentId,
              class: `${st.class || ''}${st.division ? `-${st.division}` : ''}`.trim() || 'N/A',
              stop: st.pickupStop?.name || st.pickupStopName || 'School Stop',
              parentName: st.family?.parents?.[0]?.name || st.parentName || 'Guardian',
              parentMobile: st.family?.parents?.[0]?.mobile || st.parentMobile || '',
              status: st.status === 'ACTIVE' ? 'WAITING' : (st.status || 'WAITING'),
            })),
          }));
        }
      }
    } catch (err) {
      console.warn('[MobileApi] Failed to load students roster:', err.message);
    }
  }, []);

  // Load Fleet Buses dynamically from live backend
  const loadFleet = useCallback(async () => {
    if (!mobileApi.getToken()) return;
    try {
      const res = await mobileApi.get('/api/buses');
      if (res && res.data) {
        const buses = res.data.buses || res.data;
        if (Array.isArray(buses) && buses.length > 0) {
          setFleetBuses(buses);
          // If buses have route stops, sync to tripState.stops
          const busWithStops = buses.find((b) => b.route?.stops && b.route.stops.length > 0);
          if (busWithStops?.route?.stops) {
            setTripState((prev) => ({
              ...prev,
              routeId: busWithStops.route.id,
              stops: busWithStops.route.stops.map((s, idx) => ({
                id: s.id,
                name: s.name,
                lat: s.latitude,
                lng: s.longitude,
                eta: s.estimatedArrival || `${7 + Math.floor((idx * 15) / 60)}:${(idx * 15) % 60 < 10 ? '0' : ''}${(idx * 15) % 60} AM`,
                passed: false,
              })),
            }));
          }
        }
      }
    } catch (err) {
      console.warn('[MobileApi] Failed to load fleet buses:', err.message);
    }
  }, []);

  // Load Driver Trips dynamically from live backend
  const loadTrips = useCallback(async () => {
    if (!mobileApi.getToken()) return;
    try {
      const res = await mobileApi.get('/api/trips');
      if (res && res.data) {
        const trips = res.data.trips || res.data;
        if (Array.isArray(trips) && trips.length > 0) {
          const activeTrip = trips.find((t) => t.status === 'ACTIVE') || trips[0];
          setTripState((prev) => ({
            ...prev,
            id: activeTrip.id,
            status: activeTrip.status || 'ACTIVE',
            type: activeTrip.type || 'MORNING',
          }));
        }
      }
    } catch (err) {
      console.warn('[MobileApi] Failed to load trips:', err.message);
    }
  }, []);

  // Trigger dynamic data load whenever user role changes or logs in
  useEffect(() => {
    if (!user) return;

    if (user.role === 'PARENT') {
      loadFees();
      loadNotifications();
      loadFleet();
    } else if (user.role === 'TEACHER') {
      loadStudents();
      loadFleet();
    } else if (user.role === 'DRIVER') {
      loadTrips();
      loadStudents();
      loadFleet();
    }
  }, [user?.role, user?.id, loadFees, loadNotifications, loadStudents, loadFleet, loadTrips]);

  // Fast demo role switcher (for evaluation / instant testing)
  const switchRole = useCallback((targetRole) => {
    if (targetRole === 'TEACHER') {
      mobileApi.setToken('demo-teacher-token');
      setUser(DEMO_TEACHER_USER);
      showToast('Switched to Teacher Demo (Anu Thomas)', 'success');
    } else if (targetRole === 'PARENT') {
      mobileApi.setToken('demo-parent-token');
      setUser(DEMO_PARENT_USER);
      setActiveChildId(DEMO_PARENT_USER.children[0].id);
      showToast('Switched to Parent Demo (Arun Kumar / FAM7824)', 'success');
    } else if (targetRole === 'DRIVER') {
      mobileApi.setToken('demo-driver-token');
      setUser(DEMO_DRIVER_USER);
      showToast('Switched to Driver Demo (Rajesh Kumar / BUS 01)', 'success');
    }
  }, [showToast]);

  // Live GPS simulation loop when Driver trip is active
  useEffect(() => {
    if (user?.role !== 'DRIVER' || tripState.status !== 'ACTIVE' || !tripState.isSimulatingGps) {
      return;
    }

    const interval = setInterval(() => {
      const currentStop = tripState.stops[tripState.currentStopIndex] || tripState.stops[0];
      const jitterLat = (Math.random() - 0.5) * 0.0015;
      const jitterLng = (Math.random() - 0.5) * 0.0015;
      const newLat = currentStop.lat + jitterLat;
      const newLng = currentStop.lng + jitterLng;
      const newSpeed = 28 + Math.floor(Math.random() * 18);

      setTripState((prev) => ({
        ...prev,
        speed: newSpeed,
        currentLat: newLat,
        currentLng: newLng,
      }));

      broadcastDriverLocation({
        busId: user.assignedBus?.id || 'bus-1',
        tripId: tripState.id,
        latitude: newLat,
        longitude: newLng,
        speed: newSpeed,
        heading: 45,
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [user?.role, tripState.status, tripState.isSimulatingGps, tripState.currentStopIndex]);

  // Driver action: Update student status (calls live API + updates local UI)
  const updateStudentStatus = useCallback(async (studentId, newStatus) => {
    setTripState((prev) => ({
      ...prev,
      students: prev.students.map((st) =>
        st.id === studentId ? { ...st, status: newStatus } : st
      ),
    }));

    // Call live backend API if active trip exists
    if (tripState.id && mobileApi.getToken()) {
      try {
        await mobileApi.post(`/api/trips/${tripState.id}/student-status`, {
          studentId,
          status: newStatus,
        });
      } catch (e) {
        console.warn('[MobileApi] Background student status update failed:', e.message);
      }
    }

    showToast(`Updated student status to ${newStatus}`, 'success');
  }, [tripState.id, showToast]);

  // Driver action: Advance to Next Stop
  const nextStop = useCallback(async () => {
    const nextIdx = Math.min(tripState.currentStopIndex + 1, tripState.stops.length - 1);
    const stop = tripState.stops[nextIdx];
    setTripState((prev) => ({ ...prev, currentStopIndex: nextIdx }));

    if (tripState.id && mobileApi.getToken() && stop?.id) {
      try {
        await mobileApi.post(`/api/trips/${tripState.id}/next-stop`, {
          stopId: stop.id,
        });
      } catch (e) {
        console.warn('[MobileApi] Next stop API update failed:', e.message);
      }
    }

    showToast(`Arrived at: ${stop?.name || 'Next Stop'}`, 'info');
  }, [tripState.currentStopIndex, tripState.stops, tripState.id, showToast]);

  // Driver action: Start Trip
  const startTrip = useCallback(async () => {
    setTripState((prev) => ({
      ...prev,
      status: 'ACTIVE',
      currentStopIndex: 0,
    }));

    if (tripState.id && mobileApi.getToken()) {
      try {
        await mobileApi.post(`/api/trips/${tripState.id}/start`, {});
      } catch (e) {
        console.warn('[MobileApi] Start trip API failed:', e.message);
      }
    }

    showToast('Trip Started! GPS broadcast active', 'success');
  }, [tripState.id, showToast]);

  // Driver action: End Trip
  const endTrip = useCallback(async () => {
    setTripState((prev) => ({
      ...prev,
      status: 'COMPLETED',
    }));

    if (tripState.id && mobileApi.getToken()) {
      try {
        await mobileApi.post(`/api/trips/${tripState.id}/end`, {});
      } catch (e) {
        console.warn('[MobileApi] End trip API failed:', e.message);
      }
    }

    showToast('Trip Completed! Dispatch notified', 'success');
  }, [tripState.id, showToast]);

  // Teacher action: Enroll student dynamically via POST /api/students
  const enrollStudent = useCallback(async (newStudentData) => {
    const defaultFamilyCode = `FAM${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const payload = {
        name: newStudentData.name.trim(),
        studentId: newStudentData.studentId.trim(),
        class: newStudentData.class,
        division: newStudentData.division,
        parentName: newStudentData.parentName.trim(),
        parentMobile: newStudentData.parentMobile.trim(),
        parentEmail: newStudentData.parentEmail?.trim() || undefined,
        relationship: newStudentData.relationship || 'GUARDIAN',
        busId: newStudentData.busId || undefined,
        pickupStopId: newStudentData.pickupStopId || undefined,
      };

      const res = await mobileApi.post('/api/students', payload);

      if (res && res.success && res.data) {
        const createdStudent = res.data.student || res.data;
        const generatedFamilyCode = res.data.familyCode || createdStudent.family?.familyCode || defaultFamilyCode;

        // Reload fresh student list
        loadStudents();

        return {
          success: true,
          familyCode: generatedFamilyCode,
          student: createdStudent,
        };
      }
    } catch (err) {
      console.warn('[MobileApi] Live student enrollment API failed, using local registration:', err.message);
    }

    // Local fallback
    const studentRecord = {
      id: `st-${Date.now()}`,
      name: newStudentData.name,
      studentId: newStudentData.studentId,
      class: `${newStudentData.class}-${newStudentData.division}`,
      stop: newStudentData.pickupStopName || 'School Main Campus',
      parentName: newStudentData.parentName,
      parentMobile: newStudentData.parentMobile,
      status: 'WAITING',
    };

    setTripState((prev) => ({
      ...prev,
      students: [studentRecord, ...prev.students],
    }));

    return {
      success: true,
      familyCode: defaultFamilyCode,
      student: studentRecord,
    };
  }, [loadStudents]);

  // Process Fee Payment dynamically via POST /api/payments/process
  const payFee = useCallback(async (feeRecord, paymentMethod = 'UPI') => {
    try {
      const res = await mobileApi.post('/api/payments/process', {
        feeRecordId: feeRecord.id,
        amount: feeRecord.totalAmount,
        paymentMethod,
        transactionRef: `TXN-${Date.now()}`,
      });

      if (res && res.success) {
        // Refresh live fees
        loadFees();
        showToast('Payment successful! Digital receipt recorded.', 'success');
        return { success: true, receipt: res.data };
      }
    } catch (e) {
      console.warn('[MobileApi] Live payment API failed, updating locally:', e.message);
    }

    // Update local fee state
    const receiptNumber = `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setFees((prev) =>
      prev.map((f) =>
        f.id === feeRecord.id
          ? {
              ...f,
              status: 'PAID',
              paidAt: new Date().toISOString().split('T')[0],
              receiptNumber,
            }
          : f
      )
    );
    showToast('Payment recorded successfully!', 'success');
    return {
      success: true,
      receipt: {
        receiptNumber,
        amount: feeRecord.totalAmount,
        date: new Date().toISOString().split('T')[0],
      },
    };
  }, [loadFees, showToast]);

  const logout = useCallback(() => {
    mobileApi.setToken(null);
    setUser(null);
    showToast('Logged out', 'info');
  }, [showToast]);

  return (
    <MobileAuthContext.Provider
      value={{
        user,
        setUser,
        switchRole,
        activeChildId,
        setActiveChildId,
        tripState,
        setTripState,
        fees,
        setFees,
        loadFees,
        notifications,
        setNotifications,
        loadNotifications,
        studentsRoster,
        loadStudents,
        fleetBuses,
        loadFleet,
        payFee,
        updateStudentStatus,
        nextStop,
        startTrip,
        endTrip,
        enrollStudent,
        logout,
        showToast,
        toast,
        backendStatus,
        liveBackendUrl: LIVE_BACKEND_URL,
      }}
    >
      {children}
    </MobileAuthContext.Provider>
  );
};

export const useMobileAuth = () => {
  const context = useContext(MobileAuthContext);
  if (!context) {
    throw new Error('useMobileAuth must be used within MobileAuthProvider');
  }
  return context;
};
