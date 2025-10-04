import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../components/AppIcon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TopNavigationBar from '../components/ui/TopNavigationBar';
import MobileBottomNavigation from '../components/ui/MobileBottomNavigation';
import StatusBadge from '../components/shared/StatusBadge';
import CurrencyDisplay from '../components/shared/CurrencyDisplay';
import EmptyState from '../components/shared/EmptyState';
import { formatDate, formatRelativeTime } from '../utils/formatters';

const ExpensesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  const currentUser = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'employee'
  };

  // Mock expenses data
  const mockExpenses = [
    {
      id: 'EXP-001',
      amount: 125.50,
      currency: 'INR',
      convertedAmount: 10450.75,
      companyCurrency: 'INR',
      category: 'Meals & Entertainment',
      merchant: 'Starbucks Coffee',
      date: '2025-10-01',
      status: 'pending',
      description: 'Client meeting coffee and breakfast',
      submittedAt: '2025-10-01T10:30:00Z',
      receipt: true
    },
    {
      id: 'EXP-002',
      amount: 450.00,
      currency: 'INR',
      convertedAmount: 37485.00,
      companyCurrency: 'INR',
      category: 'Travel & Transportation',
      merchant: 'Delta Airlines',
      date: '2025-09-28',
      status: 'approved',
      description: 'Flight to conference',
      submittedAt: '2025-09-28T08:00:00Z',
      receipt: true
    },
    {
      id: 'EXP-003',
      amount: 89.99,
      currency: 'INR',
      convertedAmount: 7495.17,
      companyCurrency: 'INR',
      category: 'Office Supplies',
      merchant: 'Office Depot',
      date: '2025-09-25',
      status: 'rejected',
      description: 'Wireless keyboard and mouse',
      submittedAt: '2025-09-25T14:30:00Z',
      receipt: true,
      rejectionReason: 'Not pre-approved'
    },
    {
      id: 'EXP-004',
      amount: 320.00,
      currency: 'INR',
      convertedAmount: 26640.00,
      companyCurrency: 'INR',
      category: 'Lodging',
      merchant: 'Marriott Hotel',
      date: '2025-09-20',
      status: 'approved',
      description: 'Hotel stay for business trip',
      submittedAt: '2025-09-20T16:00:00Z',
      receipt: true
    },
    {
      id: 'EXP-005',
      amount: 75.25,
      currency: 'INR',
      convertedAmount: 6267.31,
      companyCurrency: 'INR',
      category: 'Travel & Transportation',
      merchant: 'Uber',
      date: '2025-09-18',
      status: 'in-progress',
      description: 'Transportation to conference',
      submittedAt: '2025-09-18T18:20:00Z',
      receipt: true,
      currentStep: 'Finance Review'
    },
    {
      id: 'EXP-006',
      amount: 55.00,
      currency: 'INR',
      convertedAmount: 4579.50,
      companyCurrency: 'INR',
      category: 'Meals & Entertainment',
      merchant: 'Restaurant ABC',
      date: '2025-09-15',
      status: 'approved',
      description: 'Team lunch',
      submittedAt: '2025-09-15T12:00:00Z',
      receipt: true
    }
  ];

  const categories = ['all', 'Meals & Entertainment', 'Travel & Transportation', 'Office Supplies', 'Lodging'];
  const statuses = ['all', 'pending', 'in-progress', 'approved', 'rejected'];

  // Filter and sort expenses
  const filteredExpenses = mockExpenses
    .filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

  const handleLogout = () => {
    navigate('/');
  };

  const handleQuickAction = (action) => {
    if (action?.id === 'quick-add') {
      navigate('/add-expense');
    }
  };

  // Calculate stats
  const totalAmount = mockExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const pendingCount = mockExpenses.filter(exp => exp.status === 'pending').length;
  const approvedCount = mockExpenses.filter(exp => exp.status === 'approved').length;
  const rejectedCount = mockExpenses.filter(exp => exp.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigationBar user={currentUser} notificationCount={3} onLogout={handleLogout} />
      
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Expenses</h1>
                <p className="text-gray-600 mt-2">View and manage all your expense submissions</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  iconName="Download"
                  iconPosition="left"
                >
                  Export
                </Button>
                <Button
                  variant="default"
                  onClick={() => navigate('/add-expense')}
                  iconName="Plus"
                  iconPosition="left"
                >
                  New Expense
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="DollarSign" size={24} className="text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Total Submitted</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="Clock" size={24} className="text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                <p className="text-sm text-gray-600">Pending Review</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="CheckCircle" size={24} className="text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="XCircle" size={24} className="text-red-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon="Search"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="amount-desc">Highest Amount</option>
                  <option value="amount-asc">Lowest Amount</option>
                </select>
              </div>
            </div>
          </div>

          {/* Expenses List */}
          {filteredExpenses.length > 0 ? (
            <div className="space-y-4">
              {filteredExpenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/expense/${expense.id}`)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-semibold text-blue-600">{expense.id}</span>
                        <StatusBadge status={expense.status} size="sm" />
                        {expense.receipt && (
                          <span className="flex items-center space-x-1 text-xs text-gray-600">
                            <Icon name="Paperclip" size={14} />
                            <span>Receipt</span>
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {expense.merchant}
                      </h3>
                      <p className="text-gray-600 mb-3">{expense.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Icon name="Calendar" size={16} />
                          <span>{formatDate(expense.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Icon name="Tag" size={16} />
                          <span>{expense.category}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Icon name="Clock" size={16} />
                          <span>Submitted {formatRelativeTime(expense.submittedAt)}</span>
                        </div>
                      </div>

                      {expense.status === 'in-progress' && expense.currentStep && (
                        <div className="mt-3 flex items-center space-x-2 text-sm text-blue-600">
                          <Icon name="TrendingUp" size={16} />
                          <span>Current: {expense.currentStep}</span>
                        </div>
                      )}

                      {expense.status === 'rejected' && expense.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-start space-x-2">
                            <Icon name="AlertCircle" size={16} className="text-red-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-900">Rejected</p>
                              <p className="text-sm text-red-700">{expense.rejectionReason}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="ml-6 text-right">
                      <CurrencyDisplay
                        amount={expense.amount}
                        currency={expense.currency}
                        convertedAmount={expense.convertedAmount}
                        companyCurrency={expense.companyCurrency}
                        size="lg"
                      />
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          iconName="Eye"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/expense/${expense.id}`);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="Receipt"
              title="No expenses found"
              description="Try adjusting your search or filters, or create a new expense"
              actionLabel="Create Expense"
              onAction={() => navigate('/add-expense')}
            />
          )}
        </div>
      </main>

      <MobileBottomNavigation 
        user={currentUser} 
        notificationCount={3}
        onQuickAction={handleQuickAction}
      />
    </div>
  );
};

export default ExpensesPage;
