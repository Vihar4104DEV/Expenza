import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const login = useCallback((userData, token) => {
    localStorage.setItem('userToken', token);
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    setUser(userData);
    setIsAuthenticated(true);

    // Navigate based on role
    switch (userData.role) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'manager':
        navigate('/manager-approval-dashboard');
        break;
      default:
        navigate('/employee-dashboard');
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    
    setUser(null);
    setIsAuthenticated(false);
    
    navigate('/');
  }, [navigate]);

  const updateUser = useCallback((updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
  }, [user]);

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    checkAuth
  };
};
