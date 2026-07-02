import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, isAuthenticated, logout as logoutService } from '../services/authService';
import api from '../services/api';

// Create Context
const AuthContext = createContext();

// Custom hook to use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app load
useEffect(() => {
  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Try to get user from localStorage first
        let userData = getCurrentUser();
        if (!userData) {
          // If missing, fetch from backend using the token
          const res = await api.get('/auth/profile');
          userData = res.data;
          localStorage.setItem('user', JSON.stringify(userData));
        }
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // If 401, clear token and logout
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
    setLoading(false);
  };
  fetchUser();
}, []);

  // Login function (called from Login page)
  const login = (userData) => {
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    logoutService(); // Clear localStorage
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};