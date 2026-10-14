import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mobileApi } from '../config/api';
import {
  DEMO_TEACHER_USER,
  DEMO_PARENT_USER,
  DEMO_DRIVER_USER,
  INITIAL_STUDENTS_MANIFEST,
  INITIAL_ROUTE_STOPS,
} from '../data/mockData';
import { connectMobileSocket, disconnectMobileSocket, broadcastDriverLocation } from '../services/socket';

const MobileAuthContext = createContext(null);

export const MobileAuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('busly_mobile_current_user');
    return saved ? JSON.parse(saved) : DEMO_PARENT_USER; // Default to Parent for immediate preview
  });

  const [activeChildId, setActiveChildId] = useState(() => {
    return DEMO_PARENT_USER.children[0].id;
  });

  // Driver Cockpit Live State
  const [tripState, setTripState] = useState({
    id: 'trip-active-1',
    status: 'ACTIVE', // SCHEDULED, ACTIVE, COMPLETED
    type: 'MORNING', // MORNING, AFTERNOON
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

  // Save user changes to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('busly_mobile_current_user', JSON.stringify(user));
      const token = mobileApi.getToken() || 'mock-jwt-token-mobile';
      connectMobileSocket(token);
    } else {
      localStorage.removeItem('busly_mobile_current_user');
      disconnectMobileSocket();
    }
  }, [user]);

  // Fast 1-tap demo switcher for Teacher, Parent, and Driver
  const switchRole = useCallback((targetRole) => {
    if (targetRole === 'TEACHER') {
      setUser(DEMO_TEACHER_USER);
      showToast('Switched to Teacher Portal (Anu Thomas)', 'success');
    } else if (targetRole === 'PARENT') {
      setUser(DEMO_PARENT_USER);
      setActiveChildId(DEMO_PARENT_USER.children[0].id);
      showToast('Switched to Parent Portal (Arun Kumar / FAM7824)', 'success');
    } else if (targetRole === 'DRIVER') {
      setUser(DEMO_DRIVER_USER);
      showToast('Switched to Driver Cockpit (Rajesh Kumar / BUS 01)', 'success');
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

  // Driver action: Update student status
  const updateStudentStatus = useCallback((studentId, newStatus) => {
    setTripState((prev) => ({
      ...prev,
      students: prev.students.map((st) =>
        st.id === studentId ? { ...st, status: newStatus } : st
      ),
    }));
    showToast(`Updated student status to ${newStatus}`, 'success');
  }, [showToast]);

  // Driver action: Advance to Next Stop
  const nextStop = useCallback(() => {
    setTripState((prev) => {
      const nextIdx = Math.min(prev.currentStopIndex + 1, prev.stops.length - 1);
      const stopName = prev.stops[nextIdx]?.name;
      showToast(`Arrived at: ${stopName}`, 'info');
      return { ...prev, currentStopIndex: nextIdx };
    });
  }, [showToast]);

  // Driver action: Start Trip
  const startTrip = useCallback(() => {
    setTripState((prev) => ({
      ...prev,
      status: 'ACTIVE',
      currentStopIndex: 0,
    }));
    showToast('Trip Started! GPS broadcast active', 'success');
  }, [showToast]);

  // Driver action: End Trip
  const endTrip = useCallback(() => {
    setTripState((prev) => ({
      ...prev,
      status: 'COMPLETED',
    }));
    showToast('Trip Completed! Dispatch notified', 'success');
  }, [showToast]);

  // Teacher action: Enroll student and generate new Family Code
  const enrollStudent = useCallback((newStudentData) => {
    const generatedFamilyCode = newStudentData.familyCode || `FAM${Math.floor(1000 + Math.random() * 9000)}`;
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
      familyCode: generatedFamilyCode,
      student: studentRecord,
    };
  }, []);

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
        updateStudentStatus,
        nextStop,
        startTrip,
        endTrip,
        enrollStudent,
        logout,
        showToast,
        toast,
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
