import api from './api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

const authService = {
  /**
   * Register a new company and admin user
   * @param {Object} data - Registration data
   * @returns {Promise} API response
   */
  register: async (data) => {
    const payload = {
      company_name: data.companyName,
      country: data.country,
      default_currency: data.defaultCurrency || 'USD',
      admin_name: data.fullName || data.adminName,
      admin_email: data.email,
      password: data.password,
      employee_id: data.employeeId || 'ADMIN-001' // Optional, will be auto-generated in backend
    };
    
    return await api.post('/auth/admin/register/', payload);
  },

  /**
   * Login user
   * @param {Object} credentials - Email and password
   * @returns {Promise} API response with user data and token
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login/', {
      email: credentials.email,
      password: credentials.password
    });
    
    // Store auth data
    if (response.status === 1 && response.data) {
      const { token, user } = response.data;
      
      if (token) {
        localStorage.setItem('userToken', token);
      }
      
      if (user) {
        localStorage.setItem('userRole', user.role.toLowerCase());
        localStorage.setItem('userData', JSON.stringify(user));
      }
    }
    
    return response;
  },

  /**
   * Request OTP for email verification or password reset
   * @param {Object} data - Email and purpose
   * @returns {Promise} API response
   */
  requestOTP: async (data) => {
    return await api.post('/auth/otp/request/', {
      email: data.email,
      purpose: data.purpose || 'email_verification'
    });
  },

  /**
   * Verify OTP
   * @param {Object} data - Email, OTP code, and purpose
   * @returns {Promise} API response
   */
  verifyOTP: async (data) => {
    return await api.post('/auth/otp/verify/', {
      email: data.email,
      code: data.code,
      purpose: data.purpose || 'email_verification'
    });
  },

  /**
   * Change password (authenticated user)
   * @param {Object} data - Old and new password
   * @returns {Promise} API response
   */
  changePassword: async (data) => {
    return await api.post('/auth/password/change/', {
      old_password: data.oldPassword,
      new_password: data.newPassword
    });
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} API response
   */
  requestPasswordReset: async (email) => {
    return await api.post('/auth/password/reset/request/', {
      email: email
    });
  },

  /**
   * Confirm password reset with OTP
   * @param {Object} data - Email, OTP code, and new password
   * @returns {Promise} API response
   */
  confirmPasswordReset: async (data) => {
    return await api.post('/auth/password/reset/confirm/', {
      email: data.email,
      code: data.code,
      new_password: data.newPassword
    });
  },

  /**
   * Logout user (client-side)
   */
  logout: () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
  },

  /**
   * Get current user data from localStorage
   * @returns {Object|null} User data
   */
  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('userToken');
    return !!token;
  },

  /**
   * Get user role
   * @returns {string|null}
   */
  getUserRole: () => {
    return localStorage.getItem('userRole');
  }
};

export default authService;
