import api from './api';

/**
 * Expense Service
 * Handles all expense management API calls
 */

const expenseService = {
  /**
   * Get list of expenses with filters and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with expenses list
   */
  getExpenses: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.pageSize) queryParams.append('page_size', params.pageSize);
    if (params.status) queryParams.append('status', params.status);
    if (params.category) queryParams.append('category', params.category);
    if (params.dateFrom) queryParams.append('date_from', params.dateFrom);
    if (params.dateTo) queryParams.append('date_to', params.dateTo);
    if (params.employeeId) queryParams.append('employee_id', params.employeeId);
    if (params.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/expenses/?${queryString}` : '/expenses/';
    
    return await api.get(url);
  },

  /**
   * Get expense by ID
   * @param {string} expenseId - Expense ID
   * @returns {Promise} API response with expense details
   */
  getExpenseById: async (expenseId) => {
    return await api.get(`/expenses/${expenseId}/`);
  },

  /**
   * Track expense (get with approval history)
   * @param {string} expenseId - Expense ID
   * @returns {Promise} API response with tracking info
   */
  trackExpense: async (expenseId) => {
    return await api.get(`/expenses/${expenseId}/track/`);
  },

  /**
   * Create new expense
   * @param {Object} expenseData - Expense data
   * @returns {Promise} API response
   */
  createExpense: async (expenseData) => {
    // Check if there's a file (receipt image)
    if (expenseData.receiptImage instanceof File) {
      return await expenseService.createExpenseWithFile(expenseData);
    }
    
    const payload = {
      amount: parseFloat(expenseData.amount),
      original_currency: expenseData.currency || 'USD',
      category: expenseData.category,
      description: expenseData.description,
      expense_date: expenseData.date
    };
    
    return await api.post('/expenses/', payload);
  },

  /**
   * Create expense with file upload
   * @param {Object} expenseData - Expense data with file
   * @returns {Promise} API response
   */
  createExpenseWithFile: async (expenseData) => {
    const formData = new FormData();
    
    formData.append('amount', parseFloat(expenseData.amount));
    formData.append('original_currency', expenseData.currency || 'USD');
    formData.append('category', expenseData.category);
    formData.append('description', expenseData.description);
    formData.append('expense_date', expenseData.date);
    
    if (expenseData.receiptImage instanceof File) {
      formData.append('receipt_image', expenseData.receiptImage);
    }
    
    // Send as multipart/form-data
    return await api.post('/expenses/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Update expense
   * @param {string} expenseId - Expense ID
   * @param {Object} updates - Fields to update
   * @returns {Promise} API response
   */
  updateExpense: async (expenseId, updates) => {
    // Check if there's a file to upload
    if (updates.receiptImage instanceof File) {
      return await expenseService.updateExpenseWithFile(expenseId, updates);
    }
    
    const payload = {};
    
    if (updates.amount) payload.amount = parseFloat(updates.amount);
    if (updates.currency) payload.original_currency = updates.currency;
    if (updates.category) payload.category = updates.category;
    if (updates.description) payload.description = updates.description;
    if (updates.date) payload.expense_date = updates.date;
    
    return await api.patch(`/expenses/${expenseId}/`, payload);
  },

  /**
   * Update expense with file upload
   * @param {string} expenseId - Expense ID
   * @param {Object} updates - Fields to update with file
   * @returns {Promise} API response
   */
  updateExpenseWithFile: async (expenseId, updates) => {
    const formData = new FormData();
    
    if (updates.amount) formData.append('amount', parseFloat(updates.amount));
    if (updates.currency) formData.append('original_currency', updates.currency);
    if (updates.category) formData.append('category', updates.category);
    if (updates.description) formData.append('description', updates.description);
    if (updates.date) formData.append('expense_date', updates.date);
    
    if (updates.receiptImage instanceof File) {
      formData.append('receipt_image', updates.receiptImage);
    }
    
    return await api.patch(`/expenses/${expenseId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Delete expense
   * @param {string} expenseId - Expense ID
   * @returns {Promise} API response
   */
  deleteExpense: async (expenseId) => {
    return await api.delete(`/expenses/${expenseId}/`);
  },

  /**
   * Get expense categories
   * @returns {Array} List of expense categories
   */
  getCategories: () => {
    return [
      { value: 'Travel', label: 'Travel' },
      { value: 'Food', label: 'Food & Dining' },
      { value: 'Accommodation', label: 'Accommodation' },
      { value: 'Office', label: 'Office Supplies' },
      { value: 'Transport', label: 'Transportation' },
      { value: 'Entertainment', label: 'Client Entertainment' },
      { value: 'Other', label: 'Other' }
    ];
  },

  /**
   * Get expense statuses
   * @returns {Array} List of expense statuses
   */
  getStatuses: () => {
    return [
      { value: 'Pending', label: 'Pending' },
      { value: 'In-Progress', label: 'In Progress' },
      { value: 'Approved', label: 'Approved' },
      { value: 'Rejected', label: 'Rejected' }
    ];
  },

  /**
   * Get expense statistics (for dashboard)
   * @param {Object} filters - Optional filters
   * @returns {Promise} Expense statistics
   */
  getExpenseStats: async (filters = {}) => {
    // Get all expenses and calculate stats client-side
    const response = await expenseService.getExpenses({
      ...filters,
      pageSize: 1000 // Get all for stats
    });
    
    if (response.status === 1 && response.data?.expenses) {
      const expenses = response.data.expenses;
      
      const stats = {
        total: expenses.length,
        pending: expenses.filter(e => e.status === 'Pending').length,
        approved: expenses.filter(e => e.status === 'Approved').length,
        rejected: expenses.filter(e => e.status === 'Rejected').length,
        inProgress: expenses.filter(e => e.status === 'In-Progress').length,
        totalAmount: expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
        averageAmount: expenses.length > 0 
          ? expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) / expenses.length 
          : 0
      };
      
      return stats;
    }
    
    return {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      inProgress: 0,
      totalAmount: 0,
      averageAmount: 0
    };
  }
};

export default expenseService;
