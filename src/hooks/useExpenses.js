import { useState, useEffect, useCallback } from 'react';
import expenseService from '../services/expenseService';

export const useExpenses = (filters = {}) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchExpenses();
  }, [filters, pagination.page]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        status: filters.status,
        category: filters.category,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        employeeId: filters.employeeId,
        search: filters.search
      };
      
      const response = await expenseService.getExpenses(params);
      
      if (response.status === 1 && response.data) {
        setExpenses(response.data.expenses || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total_count || 0,
          totalPages: response.data.pagination?.total_pages || 0
        }));
      } else {
        setExpenses([]);
        setError(response.message || 'Failed to fetch expenses');
      }
    } catch (err) {
      console.error('Fetch expenses error:', err);
      setError(err.message || 'An error occurred while fetching expenses');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = useCallback(async (expenseData) => {
    try {
      const response = await expenseService.createExpense(expenseData);
      
      if (response.status === 1 && response.data) {
        // Refresh expenses list
        await fetchExpenses();
        return { success: true, data: response.data, message: response.message };
      }
      
      return { success: false, message: response.message || 'Failed to create expense' };
    } catch (err) {
      console.error('Add expense error:', err);
      return { success: false, message: err.message || 'An error occurred while creating expense' };
    }
  }, []);

  const updateExpense = useCallback(async (id, updates) => {
    try {
      const response = await expenseService.updateExpense(id, updates);
      
      if (response.status === 1) {
        // Update local state
        setExpenses(prev => 
          prev.map(exp => exp.id === id ? { ...exp, ...response.data } : exp)
        );
        return { success: true, data: response.data, message: response.message };
      }
      
      return { success: false, message: response.message || 'Failed to update expense' };
    } catch (err) {
      console.error('Update expense error:', err);
      return { success: false, message: err.message || 'An error occurred while updating expense' };
    }
  }, []);

  const deleteExpense = useCallback(async (id) => {
    try {
      const response = await expenseService.deleteExpense(id);
      
      if (response.status === 1) {
        // Remove from local state
        setExpenses(prev => prev.filter(exp => exp.id !== id));
        return { success: true, message: response.message };
      }
      
      return { success: false, message: response.message || 'Failed to delete expense' };
    } catch (err) {
      console.error('Delete expense error:', err);
      return { success: false, message: err.message || 'An error occurred while deleting expense' };
    }
  }, []);

  const getExpenseById = useCallback(async (id) => {
    try {
      const response = await expenseService.getExpenseById(id);
      
      if (response.status === 1 && response.data) {
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.message || 'Failed to fetch expense details' };
    } catch (err) {
      console.error('Get expense by ID error:', err);
      return { success: false, message: err.message || 'An error occurred while fetching expense' };
    }
  }, []);

  const trackExpense = useCallback(async (id) => {
    try {
      const response = await expenseService.trackExpense(id);
      
      if (response.status === 1 && response.data) {
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.message || 'Failed to track expense' };
    } catch (err) {
      console.error('Track expense error:', err);
      return { success: false, message: err.message || 'An error occurred while tracking expense' };
    }
  }, []);

  const refresh = useCallback(() => {
    fetchExpenses();
  }, [filters, pagination.page]);

  return {
    expenses,
    loading,
    error,
    pagination,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpenseById,
    trackExpense,
    refresh,
    setPage: (page) => setPagination(prev => ({ ...prev, page })),
    setPageSize: (pageSize) => setPagination(prev => ({ ...prev, pageSize, page: 1 }))
  };
};
