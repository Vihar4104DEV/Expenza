import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavigationBar from '../../components/ui/TopNavigationBar';
import MobileBottomNavigation from '../../components/ui/MobileBottomNavigation';
import QuickStatsRow from './components/QuickStatsRow';
import SubmitExpenseButton from './components/SubmitExpenseButton';
import ExpenseHistoryTable from './components/ExpenseHistoryTable';
import MonthlyInsightsPanel from './components/MonthlyInsightsPanel';
import ExpenseSubmissionModal from './components/ExpenseSubmissionModal';
import { useToastContext } from '../../components/shared/ToastProvider';
import expenseService from '../../services/expenseService';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [currentFilter, setCurrentFilter] = useState('all');
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({});
  const [insights, setInsights] = useState({});
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);

  // Get employee data from localStorage
  const getUserData = () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      return {
        name: user.name,
        email: user.email,
        role: user.role?.toLowerCase() || 'employee',
        department: user.company?.name || 'Employee',
        avatar: user.avatar || null,
        employee_id: user.employee_id,
        company: user.company // Keep the full company object
      };
    }
    return {
      name: 'Employee User',
      email: 'employee@company.com',
      role: 'employee',
      department: 'Employee',
      avatar: null,
      company: { default_currency: 'INR' }
    };
  };

  const employee = getUserData();

  // Get user currency
  const userCurrency = employee.company?.default_currency || 'INR';

  // Initialize with empty stats
  useEffect(() => {
    const initialStats = {
      submitted: { amount: 0, count: 0, currency: userCurrency },
      pending: { amount: 0, count: 0, currency: userCurrency },
      rejected: { amount: 0, count: 0, currency: userCurrency }
    };
    
    const initialInsights = {
      monthlyData: [],
      categoryData: []
    };
    
    setStats(initialStats);
    setInsights(initialInsights);
  }, []);

  const handleLogout = () => {
    // Clear user session
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const handleExpenseSubmission = async (expenseData) => {
    setIsLoading(true);
    
    try {
      // Prepare expense data for API - match backend expected format
      const apiData = {
        amount: parseFloat(expenseData.amount),
        currency: expenseData.currency || 'USD',
        category: expenseData.category,
        description: expenseData.description,
        date: expenseData.date,
        receiptImage: expenseData.file // File object if uploaded
      };
      
      // Call API to create expense
      const response = await expenseService.createExpense(apiData);
      
      if (response.status === 1) {
        toast.success(response.message || 'Expense submitted successfully!');
        // Reload expenses
        await loadExpenses();
      } else {
        toast.error(response.message || 'Failed to submit expense');
      }
    } catch (error) {
      console.error('Error submitting expense:', error);
      toast.error(error.message || 'An error occurred while submitting expense');
    } finally {
      setIsLoading(false);
    }
  };

  // Load expenses from API
  const loadExpenses = async () => {
    setIsLoadingExpenses(true);
    try {
      const response = await expenseService.getExpenses({
        page: 1,
        pageSize: 50
      });
      
      // Handle DRF paginated response format
      const expensesData = response?.results || response?.data?.expenses || [];
      
      if (expensesData.length > 0) {
        // Map backend response to frontend format
        const mappedExpenses = expensesData.map(expense => ({
          id: expense.id,
          employee_name: expense.employee?.name || expense.employee_name,
          employee_email: expense.employee?.email,
          employee_id: expense.employee?.employee_id,
          department: expense.employee?.department,
          amount: expense.amount,
          original_currency: expense.original_currency,
          category: expense.category,
          description: expense.description,
          expense_date: expense.expense_date,
          status: expense.status,
          current_approver: expense.current_approver?.name,
          approval_history: expense.approval_history || [],
          receipt_image: expense.receipt_image,
          created_at: expense.created_at,
          updated_at: expense.updated_at,
          amount_display: expense.amount_display
        }));
        
        setExpenses(mappedExpenses);
        // Calculate stats
        calculateStats(mappedExpenses);
      } else {
        setExpenses([]);
        calculateStats([]);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  // Calculate stats from expenses
  const calculateStats = (expensesList) => {
    const userCurrency = employee.company?.default_currency || 'USD';
    
    // Filter by status - backend returns: Pending, In-Progress, Approved, Rejected
    const submitted = expensesList.filter(e => ['Approved', 'In-Progress'].includes(e.status));
    const pending = expensesList.filter(e => e.status === 'Pending');
    const rejected = expensesList.filter(e => e.status === 'Rejected');
    
    setStats({
      submitted: {
        amount: submitted.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
        count: submitted.length,
        currency: userCurrency
      },
      pending: {
        amount: pending.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
        count: pending.length,
        currency: userCurrency
      },
      rejected: {
        amount: rejected.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
        count: rejected.length,
        currency: userCurrency
      }
    });
  };

  // Load expenses on mount
  useEffect(() => {
    loadExpenses();
  }, []);

  const handleExpenseClick = (expense) => {
    console.log('Expense clicked:', expense);
    // Navigate to expense detail view
    navigate(`/expense/${expense.id}`);
  };

  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
  };

  const handleQuickAction = (action) => {
    if (action?.id === 'quick-add') {
      setIsSubmissionModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <TopNavigationBar
        user={employee}
        notificationCount={3}
        onLogout={handleLogout}
      />
      {/* Main Content */}
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {employee?.name?.split(' ')?.[0]}!
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your expenses and track your spending with ease.
            </p>
          </div>

          {/* Quick Stats Row */}
          <QuickStatsRow stats={stats} />

          {/* Submit Expense Button */}
          <SubmitExpenseButton 
            onClick={() => setIsSubmissionModalOpen(true)} 
          />

          {/* Monthly Insights Panel */}
          <MonthlyInsightsPanel insights={insights} />

          {/* Expense History Table */}
          <ExpenseHistoryTable
            expenses={expenses}
            onExpenseClick={handleExpenseClick}
            onFilterChange={handleFilterChange}
            currentFilter={currentFilter}
            isLoading={isLoadingExpenses}
          />
        </div>
      </main>
      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation
        user={employee}
        notificationCount={3}
        onQuickAction={handleQuickAction}
      />
      {/* Expense Submission Modal */}
      <ExpenseSubmissionModal
        isOpen={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
        onSubmit={handleExpenseSubmission}
      />
    </div>
  );
};

export default EmployeeDashboard;