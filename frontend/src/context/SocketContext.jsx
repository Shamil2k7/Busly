'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getSocket, disconnectSocket } from '@/lib/socket-client';
import { showToast } from '@/components/ui/Toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [busLocations, setBusLocations] = useState({});
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      setSocket(null);
      setBusLocations({});
      setActiveAlerts([]);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('busly_token') : null;
    if (!token) return;

    const s = getSocket(token);
    setSocket(s);

    s.on('connect', () => {
      // Connected
    });

    // Real-time bus telemetry
    s.on('bus:location:update', (data) => {
      setBusLocations((prev) => ({
        ...prev,
        [data.busId]: {
          ...data,
          lastUpdated: new Date().toLocaleTimeString(),
        },
      }));
    });

    // Emergency alert
    s.on('emergency:alert', (alert) => {
      setActiveAlerts((prev) => [alert, ...prev.filter((a) => a.alertId !== alert.alertId)]);
      showToast(`🚨 SOS ALERT: ${alert.busNumber} - ${alert.reason}`, 'danger', 10000);
    });

    s.on('emergency:status:update', ({ alertId, status }) => {
      if (status === 'RESOLVED') {
        setActiveAlerts((prev) => prev.filter((a) => a.alertId !== alertId));
      } else {
        setActiveAlerts((prev) =>
          prev.map((a) => (a.alertId === alertId ? { ...a, status } : a))
        );
      }
    });

    s.on('student:status:update', (data) => {
      showToast(`${data.studentName} is now ${data.status.replace('_', ' ')} (${data.busNumber})`, 'info');
    });

    return () => {
      s.off('bus:location:update');
      s.off('emergency:alert');
      s.off('emergency:status:update');
      s.off('student:status:update');
    };
  }, [user]);

  const subscribeToBus = (busId) => {
    if (socket && busId) {
      socket.emit('join:bus', { busId });
    }
  };

  const unsubscribeFromBus = (busId) => {
    if (socket && busId) {
      socket.emit('leave:bus', { busId });
    }
  };

  const broadcastLocation = (locationData) => {
    if (socket) {
      socket.emit('driver:location:update', locationData);
    }
  };

  const broadcastSos = (sosData) => {
    if (socket) {
      socket.emit('driver:sos', sosData);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        busLocations,
        activeAlerts,
        subscribeToBus,
        unsubscribeFromBus,
        broadcastLocation,
        broadcastSos,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
