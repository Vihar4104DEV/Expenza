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
    const url = queryString ? `/expenses/expenses/?${queryString}` : '/expenses/expenses/';
    
    return await api.get(url);
  },

  /**
   * Get expense by ID
   * @param {string} expenseId - Expense ID
   * @returns {Promise} API response with expense details
   */
  getExpenseById: async (expenseId) => {
    return await api.get(`/expenses/expenses/${expenseId}/`);
  },

  /**
   * Track expense (get with approval history)
   * @param {string} expenseId - Expense ID
   * @returns {Promise} API response with tracking info
   */
  trackExpense: async (expenseId) => {
    return await api.get(`/expenses/expenses/${expenseId}/track/`);
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
    
    return await api.post('/expenses/expenses/', payload);
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
    return await api.post('/expenses/expenses/', formData, {
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
    
    return await api.patch(`/expenses/expenses/${expenseId}/`, payload);
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
    
    return await api.patch(`/expenses/expenses/${expenseId}/`, formData, {
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
    return await api.delete(`/expenses/expenses/${expenseId}/`);
  },

  /**
   * Get expense categories (matching backend CATEGORY_CHOICES)
   * @returns {Array} List of expense categories
   */
  getCategories: () => {
    return [
      { value: 'Travel', label: 'Travel' },
      { value: 'Food', label: 'Food' },
      { value: 'Accommodation', label: 'Accommodation' },
      { value: 'Office', label: 'Office' },
      { value: 'Transport', label: 'Transport' },
      { value: 'Entertainment', label: 'Entertainment' },
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
    
    // Handle DRF paginated response
    const expenses = response?.results || response?.data?.expenses || [];
    
    if (expenses.length > 0) {
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
  },

  /**
   * Upload receipt for OCR processing
   * @param {File} receiptImage - Receipt image file
   * @param {Object} additionalData - Optional category and description
   * @returns {Promise} API response with OCR results and created expense
   */
  uploadReceiptOCR: async (receiptImage, additionalData = {}) => {
    const formData = new FormData();
    formData.append('receipt_image', receiptImage);
    
    if (additionalData.category) {
      formData.append('category', additionalData.category);
    }
    if (additionalData.description) {
      formData.append('description', additionalData.description);
    }
    
    try {
      const response = await api.post('/expenses/expenses/ocr/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Return success flag for easier handling
      return {
        success: response.status === 1,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'OCR processing failed'
      };
    }
  },

  /**
   * Reprocess OCR for existing expense
   * @param {string} expenseId - Expense ID
   * @returns {Promise} API response with updated OCR results
   */
  reprocessOCR: async (expenseId) => {
    return await api.post(`/expenses/expenses/${expenseId}/ocr/process/`, {});
  },

  /**
   * Convert currency
   * @param {Object} conversionData - { amount, from_currency, to_currency }
   * @returns {Promise} API response with converted amount
   */
  convertCurrency: async (conversionData) => {
    const payload = {
      amount: parseFloat(conversionData.amount),
      from_currency: conversionData.from_currency,
      to_currency: conversionData.to_currency
    };
    
    return await api.post('/expenses/expenses/currency/convert/', payload);
  },

  /**
   * Get countries and their currencies
   * @returns {Promise} API response with countries and currencies
   */
  getCountriesAndCurrencies: async () => {
    return await api.get('/expenses/expenses/countries-currencies/');
  }
};

export default expenseService;
