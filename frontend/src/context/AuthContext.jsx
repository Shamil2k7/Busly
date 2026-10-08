'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api-client';
import { showToast } from '@/components/ui/Toast';
import { disconnectSocket } from '@/lib/socket-client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const getDashboardRoute = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return '/super-admin/dashboard';
      case 'SCHOOL_ADMIN':
        return '/admin/dashboard';
      case 'TEACHER':
        return '/teacher/dashboard';
      case 'DRIVER':
        return '/driver/dashboard';
      case 'PARENT':
        return '/parent/home';
      default:
        return '/';
    }
  };

  const checkAuth = async () => {
    const token = api.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/api/auth/me');
      if (res.success && res.data.user) {
        setUser(res.data.user);
      } else {
        api.setToken(null);
        setUser(null);
      }
    } catch (err) {
      api.setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const loginAdmin = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res.success) {
        api.setToken(res.data.token);
        setUser(res.data.user);
        showToast(`Welcome back, ${res.data.user.name}!`, 'success');
        router.push(getDashboardRoute(res.data.user.role));
        return { success: true };
      }
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
      return { success: false, error: err.message };
    }
  };

  const requestOtp = async ({ role, schoolCode, mobile, familyCode }) => {
    try {
      const res = await api.post('/api/auth/otp/request', {
        role,
        schoolCode,
        mobile,
        familyCode,
      });
      if (res.success) {
        showToast(res.message || 'OTP sent successfully', 'success');
        return { success: true, data: res.data };
      }
    } catch (err) {
      showToast(err.message || 'Failed to send OTP', 'error');
      return { success: false, error: err.message };
    }
  };

  const verifyOtp = async ({ sessionId, role, mobile, otp }) => {
    try {
      const res = await api.post('/api/auth/otp/verify', {
        sessionId,
        role,
        mobile,
        otp,
      });
      if (res.success) {
        api.setToken(res.data.token);
        setUser(res.data.user);
        showToast(`Logged in successfully as ${res.data.user.name}`, 'success');
        router.push(getDashboardRoute(res.data.user.role));
        return { success: true };
      }
    } catch (err) {
      showToast(err.message || 'OTP verification failed', 'error');
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout', {});
    } catch (err) {
      // ignore
    } finally {
      api.setToken(null);
      disconnectSocket();
      setUser(null);
      showToast('Logged out safely', 'info');
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginAdmin,
        requestOtp,
        verifyOtp,
        logout,
        checkAuth,
        getDashboardRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
