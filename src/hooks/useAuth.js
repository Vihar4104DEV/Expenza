import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('userToken');
      const role = localStorage.getItem('userRole');
      const userData = localStorage.getItem('userData');

      if (token && role) {
        setIsAuthenticated(true);
        setUser({
          role,
          ...(userData ? JSON.parse(userData) : {})
        });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (credentials) => {
    try {
      const response = await authService.login(credentials);
      
      if (response.status === 1 && response.data) {
        const userData = response.data.user;
        const token = response.data.token;
        
        setUser(userData);
        setIsAuthenticated(true);

        // Navigate based on role (normalize to lowercase)
        const role = userData.role.toLowerCase();
        switch (role) {
          case 'admin':
            navigate('/admin-dashboard');
            break;
          case 'manager':
            navigate('/manager-approval-dashboard');
            break;
          default:
            navigate('/employee-dashboard');
        }
        
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.message || 'An error occurred during login' 
      };
    }
  }, [navigate]);

  const register = useCallback(async (registrationData) => {
    try {
      const response = await authService.register(registrationData);
      
      if (response.status === 1) {
        return { success: true, data: response.data, message: response.message };
      }
      
      return { success: false, message: response.message || 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.message || 'An error occurred during registration' 
      };
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    
    setUser(null);
    setIsAuthenticated(false);
    
    navigate('/');
  }, [navigate]);

  const updateUser = useCallback((updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
  }, [user]);

  const verifyOTP = useCallback(async (data) => {
    try {
      const response = await authService.verifyOTP(data);
      return { success: response.status === 1, data: response.data, message: response.message };
    } catch (error) {
      console.error('OTP verification error:', error);
      return { success: false, message: error.message || 'OTP verification failed' };
    }
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    try {
      const response = await authService.requestPasswordReset(email);
      return { success: response.status === 1, message: response.message };
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, message: error.message || 'Password reset request failed' };
    }
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
    verifyOTP,
    requestPasswordReset
  };
};
