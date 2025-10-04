import { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';

export const useUsers = (filters = {}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchUsers();
  }, [filters, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        department: filters.department,
        role: filters.role,
        isActive: filters.isActive,
        search: filters.search
      };
      
      const response = await userService.getUsers(params);
      
      if (response.status === 1 && response.data) {
        setUsers(response.data.users || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total_count || 0,
          totalPages: response.data.pagination?.total_pages || 0
        }));
      } else {
        setUsers([]);
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err.message || 'An error occurred while fetching users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getUserById = useCallback(async (userId) => {
    try {
      const response = await userService.getUserById(userId);
      
      if (response.status === 1 && response.data) {
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.message || 'Failed to fetch user' };
    } catch (err) {
      console.error('Get user error:', err);
      return { success: false, message: err.message || 'An error occurred while fetching user' };
    }
  }, []);

  const createUser = useCallback(async (userData) => {
    try {
      const response = await userService.createUser(userData);
      
      if (response.status === 1 && response.data) {
        // Refresh users list
        await fetchUsers();
        return { success: true, data: response.data, message: response.message };
      }
      
      return { success: false, message: response.message || 'Failed to create user' };
    } catch (err) {
      console.error('Create user error:', err);
      return { success: false, message: err.message || 'An error occurred while creating user' };
    }
  }, []);

  const updateUser = useCallback(async (userId, updates) => {
    try {
      const response = await userService.updateUser(userId, updates);
      
      if (response.status === 1) {
        // Update local state
        setUsers(prev => 
          prev.map(user => user.id === userId ? { ...user, ...response.data } : user)
        );
        return { success: true, data: response.data, message: response.message };
      }
      
      return { success: false, message: response.message || 'Failed to update user' };
    } catch (err) {
      console.error('Update user error:', err);
      return { success: false, message: err.message || 'An error occurred while updating user' };
    }
  }, []);

  const deleteUser = useCallback(async (userId) => {
    try {
      const response = await userService.deleteUser(userId);
      
      if (response.status === 1) {
        // Remove from local state
        setUsers(prev => prev.filter(user => user.id !== userId));
        return { success: true, message: response.message };
      }
      
      return { success: false, message: response.message || 'Failed to delete user' };
    } catch (err) {
      console.error('Delete user error:', err);
      return { success: false, message: err.message || 'An error occurred while deleting user' };
    }
  }, []);

  const activateUser = useCallback(async (userId) => {
    try {
      const response = await userService.activateUser(userId);
      
      if (response.status === 1) {
        // Update local state
        setUsers(prev => 
          prev.map(user => user.id === userId ? { ...user, is_active: true } : user)
        );
        return { success: true, message: response.message };
      }
      
      return { success: false, message: response.message || 'Failed to activate user' };
    } catch (err) {
      console.error('Activate user error:', err);
      return { success: false, message: err.message || 'An error occurred while activating user' };
    }
  }, []);

  const deactivateUser = useCallback(async (userId) => {
    try {
      const response = await userService.deactivateUser(userId);
      
      if (response.status === 1) {
        // Update local state
        setUsers(prev => 
          prev.map(user => user.id === userId ? { ...user, is_active: false } : user)
        );
        return { success: true, message: response.message };
      }
      
      return { success: false, message: response.message || 'Failed to deactivate user' };
    } catch (err) {
      console.error('Deactivate user error:', err);
      return { success: false, message: err.message || 'An error occurred while deactivating user' };
    }
  }, []);

  const getManagers = useCallback(async () => {
    try {
      const response = await userService.getManagers();
      
      if (response.status === 1 && response.data) {
        return { success: true, data: response.data.users || [] };
      }
      
      return { success: false, data: [], message: response.message };
    } catch (err) {
      console.error('Get managers error:', err);
      return { success: false, data: [], message: err.message };
    }
  }, []);

  const getDepartments = useCallback(async () => {
    try {
      const departments = await userService.getDepartments();
      return { success: true, data: departments };
    } catch (err) {
      console.error('Get departments error:', err);
      return { success: false, data: [], message: err.message };
    }
  }, []);

  const refresh = useCallback(() => {
    fetchUsers();
  }, [filters, pagination.page]);

  return {
    users,
    loading,
    error,
    pagination,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser,
    getManagers,
    getDepartments,
    refresh,
    setPage: (page) => setPagination(prev => ({ ...prev, page })),
    setPageSize: (pageSize) => setPagination(prev => ({ ...prev, pageSize, page: 1 }))
  };
};
