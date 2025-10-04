import api from './api';

/**
 * Approval Service
 * Handles all approval workflow and expense approval API calls
 */

const approvalService = {
  // ============ Approval Workflows ============
  
  /**
   * Get list of workflows
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with workflows
   */
  getWorkflows: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.ruleType) queryParams.append('rule_type', params.ruleType);
    if (params.isDefault !== undefined) queryParams.append('is_default', params.isDefault);
    if (params.isActive !== undefined) queryParams.append('is_active', params.isActive);
    if (params.search) queryParams.append('search', params.search);
    if (params.ordering) queryParams.append('ordering', params.ordering);
    
    const queryString = queryParams.toString();
    return await api.get(`/approvals/workflows/${queryString ? '?' + queryString : ''}`);
  },

  /**
   * Create new workflow
   * @param {Object} workflowData - Workflow data
   * @returns {Promise} API response
   */
  createWorkflow: async (workflowData) => {
    return await api.post('/approvals/workflows/', {
      name: workflowData.name,
      rule_type: workflowData.ruleType,
      min_amount: workflowData.minAmount,
      max_amount: workflowData.maxAmount,
      is_default: workflowData.isDefault || false
    });
  },

  /**
   * Get workflow by ID
   * @param {string} workflowId - Workflow ID
   * @returns {Promise} API response
   */
  getWorkflowById: async (workflowId) => {
    return await api.get(`/approvals/workflows/${workflowId}/`);
  },

  /**
   * Update workflow
   * @param {string} workflowId - Workflow ID
   * @param {Object} updates - Fields to update
   * @returns {Promise} API response
   */
  updateWorkflow: async (workflowId, updates) => {
    const payload = {};
    if (updates.name) payload.name = updates.name;
    if (updates.ruleType) payload.rule_type = updates.ruleType;
    if (updates.minAmount !== undefined) payload.min_amount = updates.minAmount;
    if (updates.maxAmount !== undefined) payload.max_amount = updates.maxAmount;
    if (updates.isDefault !== undefined) payload.is_default = updates.isDefault;
    
    return await api.patch(`/approvals/workflows/${workflowId}/`, payload);
  },

  /**
   * Delete workflow
   * @param {string} workflowId - Workflow ID
   * @returns {Promise} API response
   */
  deleteWorkflow: async (workflowId) => {
    return await api.delete(`/approvals/workflows/${workflowId}/`);
  },

  /**
   * Add approver to workflow
   * @param {string} workflowId - Workflow ID
   * @param {Object} data - Approver data
   * @returns {Promise} API response
   */
  addApproverToWorkflow: async (workflowId, data) => {
    return await api.post(`/approvals/workflows/${workflowId}/add_approver/`, {
      approver: data.approverId,
      sequence: data.sequence
    });
  },

  /**
   * Update workflow approvers
   * @param {string} workflowId - Workflow ID
   * @param {Array} approvers - Array of approver objects
   * @returns {Promise} API response
   */
  updateWorkflowApprovers: async (workflowId, approvers) => {
    return await api.put(`/approvals/workflows/${workflowId}/update_approvers/`, {
      approvers: approvers.map(a => ({
        approver: a.approverId,
        sequence: a.sequence
      }))
    });
  },

  /**
   * Reorder workflow approvers
   * @param {string} workflowId - Workflow ID
   * @param {Array} approverOrders - Array of approver order objects
   * @returns {Promise} API response
   */
  reorderWorkflowApprovers: async (workflowId, approverOrders) => {
    return await api.post(`/approvals/workflows/${workflowId}/reorder_approvers/`, {
      approver_orders: approverOrders.map(a => ({
        approver_id: a.approverId,
        sequence: a.sequence
      }))
    });
  },

  /**
   * Set workflow as default
   * @param {string} workflowId - Workflow ID
   * @returns {Promise} API response
   */
  setDefaultWorkflow: async (workflowId) => {
    return await api.post(`/approvals/workflows/${workflowId}/set_default/`);
  },

  /**
   * Get workflow statistics
   * @param {string} workflowId - Workflow ID
   * @returns {Promise} API response
   */
  getWorkflowStatistics: async (workflowId) => {
    return await api.get(`/approvals/workflows/${workflowId}/statistics/`);
  },

  /**
   * Get default workflow
   * @returns {Promise} API response
   */
  getDefaultWorkflow: async () => {
    return await api.get('/approvals/workflows/default/');
  },

  /**
   * Create workflow with approvers
   * @param {Object} data - Workflow and approvers data
   * @returns {Promise} API response
   */
  createWorkflowWithApprovers: async (data) => {
    return await api.post('/approvals/workflows/create-with-approvers/', {
      workflow: {
        name: data.workflow.name,
        rule_type: data.workflow.ruleType,
        min_amount: data.workflow.minAmount,
        max_amount: data.workflow.maxAmount,
        is_default: data.workflow.isDefault || false
      },
      approvers: data.approvers.map(a => ({
        approver: a.approverId,
        sequence: a.sequence
      }))
    });
  },

  /**
   * Get workflow analytics
   * @param {string} workflowId - Workflow ID
   * @returns {Promise} API response
   */
  getWorkflowAnalytics: async (workflowId) => {
    return await api.get(`/approvals/workflows/${workflowId}/analytics/`);
  },

  // ============ Workflow Approvers ============
  
  /**
   * Get list of workflow approvers
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  getWorkflowApprovers: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.workflow) queryParams.append('workflow', params.workflow);
    if (params.approver) queryParams.append('approver', params.approver);
    if (params.sequence) queryParams.append('sequence', params.sequence);
    if (params.ordering) queryParams.append('ordering', params.ordering);
    
    const queryString = queryParams.toString();
    return await api.get(`/approvals/workflow-approvers/${queryString ? '?' + queryString : ''}`);
  },

  /**
   * Create workflow approver
   * @param {Object} data - Workflow approver data
   * @returns {Promise} API response
   */
  createWorkflowApprover: async (data) => {
    return await api.post('/approvals/workflow-approvers/', {
      workflow: data.workflowId,
      approver: data.approverId,
      sequence: data.sequence
    });
  },

  /**
   * Get workflow approver by ID
   * @param {string} approverId - Workflow approver ID
   * @returns {Promise} API response
   */
  getWorkflowApproverById: async (approverId) => {
    return await api.get(`/approvals/workflow-approvers/${approverId}/`);
  },

  /**
   * Update workflow approver
   * @param {string} approverId - Workflow approver ID
   * @param {Object} updates - Fields to update
   * @returns {Promise} API response
   */
  updateWorkflowApprover: async (approverId, updates) => {
    return await api.patch(`/approvals/workflow-approvers/${approverId}/`, updates);
  },

  /**
   * Delete workflow approver
   * @param {string} approverId - Workflow approver ID
   * @returns {Promise} API response
   */
  deleteWorkflowApprover: async (approverId) => {
    return await api.delete(`/approvals/workflow-approvers/${approverId}/`);
  },

  // ============ Expense Approvals ============
  
  /**
   * Get list of expense approvals
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  getExpenseApprovals: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.expense) queryParams.append('expense', params.expense);
    if (params.approver) queryParams.append('approver', params.approver);
    if (params.decision) queryParams.append('decision', params.decision);
    if (params.stepNumber) queryParams.append('step_number', params.stepNumber);
    if (params.ordering) queryParams.append('ordering', params.ordering);
    
    const queryString = queryParams.toString();
    return await api.get(`/approvals/approvals/${queryString ? '?' + queryString : ''}`);
  },

  /**
   * Get expense approval by ID
   * @param {string} approvalId - Approval ID
   * @returns {Promise} API response
   */
  getExpenseApprovalById: async (approvalId) => {
    return await api.get(`/approvals/approvals/${approvalId}/`);
  },

  /**
   * Get pending approvals for current user
   * @returns {Promise} API response
   */
  getPendingApprovals: async () => {
    return await api.get('/approvals/approvals/pending/');
  },

  /**
   * Make approval decision
   * @param {string} approvalId - Approval ID
   * @param {Object} decision - Decision data
   * @returns {Promise} API response
   */
  makeApprovalDecision: async (approvalId, decision) => {
    return await api.post(`/approvals/approvals/${approvalId}/decide/`, {
      decision: decision.decision, // 'Approved' or 'Rejected'
      comments: decision.comments
    });
  },

  /**
   * Escalate approval
   * @param {string} approvalId - Approval ID
   * @param {Object} data - Escalation data
   * @returns {Promise} API response
   */
  escalateApproval: async (approvalId, data) => {
    return await api.post(`/approvals/approvals/${approvalId}/escalate/`, {
      escalated_to: data.escalatedTo,
      reason: data.reason
    });
  },

  /**
   * Get approval statistics
   * @returns {Promise} API response
   */
  getApprovalStatistics: async () => {
    return await api.get('/approvals/approvals/statistics/');
  },

  /**
   * Get approval history for expense
   * @param {string} expenseId - Expense ID
   * @returns {Promise} API response
   */
  getApprovalHistory: async (expenseId) => {
    return await api.get(`/approvals/approvals/history/?expense_id=${expenseId}`);
  },

  /**
   * Bulk approve expenses
   * @param {Object} data - Bulk approval data
   * @returns {Promise} API response
   */
  bulkApproveExpenses: async (data) => {
    return await api.post('/approvals/approvals/bulk-approve/', {
      expense_ids: data.expenseIds,
      decision: data.decision,
      comments: data.comments
    });
  },

  /**
   * Escalate expense directly
   * @param {string} expenseId - Expense ID
   * @param {Object} data - Escalation data
   * @returns {Promise} API response
   */
  escalateExpense: async (expenseId, data) => {
    return await api.post(`/approvals/expenses/${expenseId}/escalate/`, {
      escalated_to: data.escalatedTo,
      reason: data.reason
    });
  },

  /**
   * Get approval dashboard data
   * @returns {Promise} API response with dashboard data
   */
  getApprovalDashboard: async () => {
    return await api.get('/approvals/dashboard/');
  }
};

export default approvalService;
