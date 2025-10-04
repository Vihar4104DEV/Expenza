import api from './api';

/**
 * Company Service
 * Handles all company management API calls
 */

const companyService = {
  /**
   * Get list of companies with filters
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with companies list
   */
  getCompanies: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.country) queryParams.append('country', params.country);
    if (params.defaultCurrency) queryParams.append('default_currency', params.defaultCurrency);
    if (params.isActive !== undefined) queryParams.append('is_active', params.isActive);
    if (params.search) queryParams.append('search', params.search);
    if (params.ordering) queryParams.append('ordering', params.ordering);
    
    const queryString = queryParams.toString();
    return await api.get(`/companies/companies/${queryString ? '?' + queryString : ''}`);
  },

  /**
   * Create new company
   * @param {Object} companyData - Company data
   * @returns {Promise} API response
   */
  createCompany: async (companyData) => {
    return await api.post('/companies/companies/', {
      name: companyData.name,
      country: companyData.country,
      default_currency: companyData.defaultCurrency
    });
  },

  /**
   * Get company by ID
   * @param {string} companyId - Company ID
   * @returns {Promise} API response with company details
   */
  getCompanyById: async (companyId) => {
    return await api.get(`/companies/companies/${companyId}/`);
  },

  /**
   * Update company
   * @param {string} companyId - Company ID
   * @param {Object} updates - Fields to update
   * @returns {Promise} API response
   */
  updateCompany: async (companyId, updates) => {
    const payload = {};
    if (updates.name) payload.name = updates.name;
    if (updates.country) payload.country = updates.country;
    if (updates.defaultCurrency) payload.default_currency = updates.defaultCurrency;
    
    return await api.patch(`/companies/companies/${companyId}/`, payload);
  },

  /**
   * Delete company
   * @param {string} companyId - Company ID
   * @returns {Promise} API response
   */
  deleteCompany: async (companyId) => {
    return await api.delete(`/companies/companies/${companyId}/`);
  },

  /**
   * Get company users
   * @param {string} companyId - Company ID
   * @param {string} role - Optional role filter
   * @returns {Promise} API response with users
   */
  getCompanyUsers: async (companyId, role = null) => {
    const url = role 
      ? `/companies/companies/${companyId}/users/?role=${role}`
      : `/companies/companies/${companyId}/users/`;
    return await api.get(url);
  },

  /**
   * Get company statistics
   * @param {string} companyId - Company ID
   * @returns {Promise} API response with statistics
   */
  getCompanyStatistics: async (companyId) => {
    return await api.get(`/companies/companies/${companyId}/statistics/`);
  },

  /**
   * Create company with admin user
   * @param {Object} data - Company and admin data
   * @returns {Promise} API response
   */
  createCompanyWithAdmin: async (data) => {
    return await api.post('/companies/companies/create_with_admin/', {
      company: {
        name: data.company.name,
        country: data.company.country,
        default_currency: data.company.defaultCurrency
      },
      admin: {
        name: data.admin.name,
        email: data.admin.email,
        password: data.admin.password
      }
    });
  }
};

export default companyService;
