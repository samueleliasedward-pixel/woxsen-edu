// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('🔍 Checking auth with token...');
        const response = await authApi.getMe();
        console.log('✅ Auth check successful:', response.data);
        
        // Handle different response formats
        if (response.data.data?.user) {
          setUser(response.data.data.user);
        } else {
          setUser(response.data.user);
        }
      }
    } catch (err) {
      console.error('❌ Auth check failed:', err);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED LOGIN FUNCTION - Handles both response formats
  const login = async (email, password, role) => {
    try {
      setError(null);
      console.log('📝 Sending login request:', { email, role });
      
      const response = await authApi.login({ email, password, role });
      console.log('✅ Login response (full):', response);
      console.log('✅ Login response data:', response.data);
      
      // Extract token and user from response (handles both formats)
      let token, user;
      
      // Check if response has data wrapper (backend format: { success: true, data: { token, user } })
      if (response.data.data) {
        console.log('📦 Using nested data format');
        token = response.data.data.token;
        user = response.data.data.user;
      } 
      // Direct format (frontend expected: { success: true, token, user })
      else {
        console.log('📦 Using direct format');
        token = response.data.token;
        user = response.data.user;
      }
      
      console.log('🔑 Token extracted:', token ? '✅ Present' : '❌ Missing');
      console.log('👤 User extracted:', user);
      
      if (!token || !user) {
        throw new Error('Invalid response format: missing token or user');
      }
      
      // Store token
      localStorage.setItem('token', token);
      
      // Set user in state
      setUser(user);
      
      // Return success with user info for redirect
      return { 
        success: true, 
        user: user,
        role: user.role 
      };
      
    } catch (err) {
      console.error('❌ Login error:', err);
      console.error('Error response:', err.response?.data);
      
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMsg);
      
      return { 
        success: false, 
        error: errorMsg 
      };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      console.log('📝 Registering user:', userData);
      const response = await authApi.register(userData);
      console.log('📥 Register response:', response.data);
      
      // Handle different response formats
      if (response.data.data) {
        return { success: true, data: response.data.data };
      } else {
        return { success: true, data: response.data };
      }
    } catch (err) {
      console.error('❌ Register error:', err);
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};