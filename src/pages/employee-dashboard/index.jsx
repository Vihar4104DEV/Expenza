import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavigationBar from '../../components/ui/TopNavigationBar';
import MobileBottomNavigation from '../../components/ui/MobileBottomNavigation';
import QuickStatsRow from './components/QuickStatsRow';
import SubmitExpenseButton from './components/SubmitExpenseButton';
import ExpenseHistoryTable from './components/ExpenseHistoryTable';
import MonthlyInsightsPanel from './components/MonthlyInsightsPanel';
import ExpenseSubmissionModal from './components/ExpenseSubmissionModal';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [currentFilter, setCurrentFilter] = useState('all');
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({});
  const [insights, setInsights] = useState({});
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);

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

  // Mock stats data
  const mockStats = {
    submitted: { amount: 3245.50, count: 12, currency: userCurrency },
    pending: { amount: 1150.75, count: 4, currency: userCurrency },
    rejected: { amount: 0, count: 0, currency: userCurrency }
  };

  // Mock insights data
  const mockInsights = {
    monthlyData: [
      { month: 'Aug', amount: 1250 },
      { month: 'Sep', amount: 1890 },
      { month: 'Oct', amount: 2100 },
      { month: 'Nov', amount: 1650 },
      { month: 'Dec', amount: 2300 },
      { month: 'Jan', amount: 1950 }
    ],
    categoryData: [
      { name: 'Travel', value: 2500, color: '#2563EB' },
      { name: 'Meals', value: 1200, color: '#10B981' },
      { name: 'Office Supplies', value: 800, color: '#F59E0B' },
      { name: 'Transportation', value: 600, color: '#EF4444' },
      { name: 'Lodging', value: 1100, color: '#8B5CF6' }
    ]
  };

  useEffect(() => {
    // Initialize data
    setStats(mockStats);
    setInsights(mockInsights);
  }, []);

  const handleLogout = () => {
    // Clear user session
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const handleExpenseSubmission = (expenseData) => {
    console.log('Expense submitted:', expenseData);
    
    // Create new expense entry
    const newExpense = {
      id: `EXP-${Date.now()}`,
      date: expenseData?.date,
      merchant: expenseData?.merchant,
      amount: parseFloat(expenseData?.amount),
      category: expenseData?.category,
      status: 'pending',
      description: expenseData?.description,
      currency: expenseData?.currency,
      receiptUrl: expenseData?.file ? URL.createObjectURL(expenseData?.file) : null,
      submittedAt: new Date()?.toISOString()
    };

    // Update expenses list
    setExpenses(prev => [newExpense, ...prev]);

    // Update stats
    setStats(prev => ({
      ...prev,
      submitted: {
        amount: prev?.submitted?.amount + newExpense?.amount,
        count: prev?.submitted?.count + 1
      },
      pending: {
        amount: prev?.pending?.amount + newExpense?.amount,
        count: prev?.pending?.count + 1
      }
    }));

    // Show success message (you can implement toast notifications here)
    console.log('Expense submitted successfully!');
  };

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