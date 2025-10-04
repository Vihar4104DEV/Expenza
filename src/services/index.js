/**
 * Services Index
 * Central export point for all API services
 */

import api from './api';
import authService from './authService';
import userService from './userService';
import expenseService from './expenseService';
import companyService from './companyService';
import approvalService from './approvalService';

export {
  api,
  authService,
  userService,
  expenseService,
  companyService,
  approvalService
};

export default {
  api,
  authService,
  userService,
  expenseService,
  companyService,
  approvalService
};
