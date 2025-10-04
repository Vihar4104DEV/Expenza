import { useState, useEffect, useCallback } from 'react';

export const useExpenses = (filters = {}) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    fetchExpenses();
  }, [filters, pagination.page]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would be an API call
      // For now, return mock data
      const mockExpenses = generateMockExpenses();
      
      // Apply filters
      let filtered = mockExpenses;
      
      if (filters.status) {
        filtered = filtered.filter(exp => exp.status === filters.status);
      }
      
      if (filters.category) {
        filtered = filtered.filter(exp => exp.category === filters.category);
      }
      
      if (filters.dateFrom) {
        filtered = filtered.filter(exp => new Date(exp.date) >= new Date(filters.dateFrom));
      }
      
      if (filters.dateTo) {
        filtered = filtered.filter(exp => new Date(exp.date) <= new Date(filters.dateTo));
      }
      
      setExpenses(filtered);
      setPagination(prev => ({ ...prev, total: filtered.length }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = useCallback((expenseData) => {
    const newExpense = {
      id: `EXP-${Date.now()}`,
      ...expenseData,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    
    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  }, []);

  const updateExpense = useCallback((id, updates) => {
    setExpenses(prev => 
      prev.map(exp => exp.id === id ? { ...exp, ...updates } : exp)
    );
  }, []);

  const deleteExpense = useCallback((id) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
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
    refresh,
    setPage: (page) => setPagination(prev => ({ ...prev, page }))
  };
};

// Mock data generator
const generateMockExpenses = () => {
  return [
    {
      id: 'EXP-001',
      amount: 125.50,
      currency: 'USD',
      category: 'Meals & Entertainment',
      description: 'Client meeting lunch',
      date: '2025-10-01',
      status: 'pending',
      merchant: 'Restaurant ABC',
      submittedAt: '2025-10-01T10:00:00Z'
    },
    {
      id: 'EXP-002',
      amount: 450.00,
      currency: 'USD',
      category: 'Travel & Transportation',
      description: 'Flight to conference',
      date: '2025-09-28',
      status: 'approved',
      merchant: 'Delta Airlines',
      submittedAt: '2025-09-28T08:00:00Z'
    },
    {
      id: 'EXP-003',
      amount: 89.99,
      currency: 'USD',
      category: 'Office Supplies',
      description: 'Wireless keyboard and mouse',
      date: '2025-09-25',
      status: 'rejected',
      merchant: 'Office Depot',
      submittedAt: '2025-09-25T14:30:00Z',
      rejectionReason: 'Not pre-approved'
    }
  ];
};
