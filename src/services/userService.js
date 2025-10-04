import api from './api';

/**
 * User Service
 * Handles all user management API calls
 */

const userService = {
  /**
   * Get list of users with filters and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with users list
   */
  getUsers: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.pageSize) queryParams.append('page_size', params.pageSize);
    if (params.department) queryParams.append('department', params.department);
    if (params.role) queryParams.append('role', params.role);
    if (params.isActive !== undefined) queryParams.append('is_active', params.isActive);
    if (params.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/users/?${queryString}` : '/users/';
    
    return await api.get(url);
  },

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise} API response with user details
   */
  getUserById: async (userId) => {
    return await api.get(`/users/${userId}/`);
  },

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise} API response
   */
  createUser: async (userData) => {
    const payload = {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      password: userData.password,
      department: userData.department
    };
    
    // Add manager_id if provided (required for Employee role)
    if (userData.managerId) {
      payload.manager_id = userData.managerId;
    }
    
    // Add mobile number if provided
    if (userData.mobileNo) {
      payload.mobile_no = userData.mobileNo;
    }
    
    return await api.post('/users/', payload);
  },

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise} API response
   */
  updateUser: async (userId, updates) => {
    const payload = {};
    
    if (updates.name) payload.name = updates.name;
    if (updates.email) payload.email = updates.email;
    if (updates.role) payload.role = updates.role;
    if (updates.department) payload.department = updates.department;
    if (updates.managerId !== undefined) payload.manager_id = updates.managerId;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;
    if (updates.mobileNo !== undefined) payload.mobile_no = updates.mobileNo;
    if (updates.isManagerApprover !== undefined) payload.is_manager_approver = updates.isManagerApprover;
    
    return await api.patch(`/users/${userId}/`, payload);
  },

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise} API response
   */
  deleteUser: async (userId) => {
    return await api.delete(`/users/${userId}/`);
  },

  /**
   * Activate user
   * @param {string} userId - User ID
   * @returns {Promise} API response
   */
  activateUser: async (userId) => {
    return await api.post(`/users/${userId}/activate/`);
  },

  /**
   * Deactivate user
   * @param {string} userId - User ID
   * @returns {Promise} API response
   */
  deactivateUser: async (userId) => {
    return await api.post(`/users/${userId}/deactivate/`);
  },

  /**
   * Get managers list (for dropdown)
   * @returns {Promise} API response with managers
   */
  getManagers: async () => {
    return await api.get('/users/?role=Manager&page_size=100');
  },

  /**
   * Get all departments (unique list)
   * @returns {Promise} Array of department names
   */
  getDepartments: async () => {
    const response = await api.get('/users/?page_size=1000');
    
    if (response.status === 1 && response.data?.users) {
      // Extract unique departments
      const departments = [...new Set(
        response.data.users
          .map(user => user.department)
          .filter(dept => dept && dept.trim())
      )].sort();
      
      return departments;
    }
    
    return [];
  },

  // ViewSet endpoints
  getUsersViewSet: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.role) queryParams.append('role', params.role);
    if (params.department) queryParams.append('department', params.department);
    if (params.isManagerApprover !== undefined) queryParams.append('is_manager_approver', params.isManagerApprover);
    if (params.isActive !== undefined) queryParams.append('is_active', params.isActive);
    if (params.search) queryParams.append('search', params.search);
    if (params.ordering) queryParams.append('ordering', params.ordering);
    
    const queryString = queryParams.toString();
    return await api.get(`/users/users/${queryString ? '?' + queryString : ''}`);
  },

  getCurrentUser: async () => {
    return await api.get('/users/users/me/');
  },

  changeUserPassword: async (oldPassword, newPassword) => {
    return await api.put('/users/users/change_password/', {
      old_password: oldPassword,
      new_password: newPassword
    });
  },

  getSubordinates: async () => {
    return await api.get('/users/users/subordinates/');
  },

  getTeamExpenses: async () => {
    return await api.get('/users/users/team_expenses/');
  },

  getPendingApprovals: async () => {
    return await api.get('/users/users/pending_approvals/');
  },

  updateUserRole: async (userId, role, managerId = null) => {
    return await api.put(`/users/users/${userId}/update_role/`, {
      role,
      manager: managerId
    });
  },

  getCompanyApprovers: async () => {
    return await api.get('/users/users/approvers/');
  }
};

export default userService;
