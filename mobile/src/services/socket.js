import { io } from 'socket.io-client';
import { mobileApi } from '../config/api';

let socket = null;
const listeners = new Map();

export const connectMobileSocket = (token) => {
  if (!token) return null;

  if (socket && socket.connected) {
    return socket;
  }

  const socketUrl = mobileApi.getBaseUrl();
  try {
    socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 4,
      reconnectionDelay: 1500,
      timeout: 5000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Mobile connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Mobile disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error (running in local simulation mode):', err.message);
    });

    return socket;
  } catch (err) {
    console.warn('[Socket] Failed to init socket:', err.message);
    return null;
  }
};

export const getMobileSocket = () => socket;

export const disconnectMobileSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinBusRoom = (busId) => {
  if (socket && socket.connected && busId) {
    socket.emit('join:bus', { busId });
  }
};

export const broadcastDriverLocation = (data) => {
  if (socket && socket.connected) {
    socket.emit('driver:location:update', data);
  }
};

export const broadcastDriverSos = (data) => {
  if (socket && socket.connected) {
    socket.emit('driver:sos', data);
  }
};
