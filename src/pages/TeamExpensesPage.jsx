import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../components/AppIcon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TopNavigationBar from '../components/ui/TopNavigationBar';
import MobileBottomNavigation from '../components/ui/MobileBottomNavigation';
import StatusBadge from '../components/shared/StatusBadge';
import CurrencyDisplay from '../components/shared/CurrencyDisplay';
import { formatDate } from '../utils/formatters';

const TeamExpensesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const memberId = searchParams.get('member');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Get current user from localStorage
  const getUserData = () => {
    const role = localStorage.getItem('userRole') || 'employee';
    const userData = localStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData);
    }
    return {
      name: role === 'admin' ? 'Admin User' : 'Manager User',
      email: role === 'admin' ? 'admin@company.com' : 'manager@company.com',
      role: role
    };
  };

  const currentUser = getUserData();
  const isManager = currentUser.role === 'manager';
  const isAdmin = currentUser.role === 'admin';

  // Manager's team member IDs (Engineering department)
  const managerTeamIds = [2, 4, 5, 6]; // Mike Chen, Alex Rodriguez, Lisa Wang, John Smith

  const allExpenses = [
    {
      id: 'EXP-001',
      employee: { name: 'Sarah Johnson', id: 1, department: 'Marketing' },
      amount: 125.50,
      currency: 'USD',
      convertedAmount: 10450.75,
      companyCurrency: 'INR',
      category: 'Meals & Entertainment',
      merchant: 'Starbucks Coffee',
      date: '2025-10-01',
      status: 'pending',
      description: 'Client meeting coffee',
      submittedAt: '2025-10-01T10:30:00Z'
    },
    {
      id: 'EXP-002',
      employee: { name: 'Mike Chen', id: 2, department: 'Engineering' },
      amount: 450.00,
      currency: 'USD',
      convertedAmount: 37485.00,
      companyCurrency: 'INR',
      category: 'Travel & Transportation',
      merchant: 'Delta Airlines',
      date: '2025-09-28',
      status: 'approved',
      description: 'Flight to conference',
      submittedAt: '2025-09-28T08:00:00Z'
    },
    {
      id: 'EXP-003',
      employee: { name: 'Emily Davis', id: 3, department: 'Sales' },
      amount: 89.99,
      currency: 'USD',
      convertedAmount: 7495.17,
      companyCurrency: 'INR',
      category: 'Office Supplies',
      merchant: 'Office Depot',
      date: '2025-09-25',
      status: 'rejected',
      description: 'Wireless keyboard and mouse',
      submittedAt: '2025-09-25T14:30:00Z'
    },
    {
      id: 'EXP-004',
      employee: { name: 'Alex Rodriguez', id: 4, department: 'Engineering' },
      amount: 320.00,
      currency: 'USD',
      convertedAmount: 26640.00,
      companyCurrency: 'INR',
      category: 'Lodging',
      merchant: 'Marriott Hotel',
      date: '2025-09-20',
      status: 'approved',
      description: 'Hotel stay for business trip',
      submittedAt: '2025-09-20T16:00:00Z'
    },
    {
      id: 'EXP-005',
      employee: { name: 'Lisa Wang', id: 5, department: 'Engineering' },
      amount: 75.25,
      currency: 'USD',
      convertedAmount: 6267.31,
      companyCurrency: 'INR',
      category: 'Travel & Transportation',
      merchant: 'Uber',
      date: '2025-09-18',
      status: 'pending',
      description: 'Transportation to conference',
      submittedAt: '2025-09-18T18:20:00Z'
    }
  ];

  // Filter expenses based on role
  // Manager sees only their team's expenses
  // Admin sees all expenses
  const mockExpenses = isManager
    ? allExpenses.filter(expense => managerTeamIds.includes(expense.employee.id))
    : allExpenses;

  const filteredExpenses = mockExpenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesMember = !memberId || expense.employee.id === parseInt(memberId);
    return matchesSearch && matchesStatus && matchesCategory && matchesMember;
  });

  const handleLogout = () => {
    navigate('/');
  };

  const categories = ['all', 'Meals & Entertainment', 'Travel & Transportation', 'Office Supplies', 'Lodging'];
  const statuses = ['all', 'pending', 'approved', 'rejected'];

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const pendingCount = filteredExpenses.filter(exp => exp.status === 'pending').length;
  const approvedCount = filteredExpenses.filter(exp => exp.status === 'approved').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigationBar user={currentUser} notificationCount={5} onLogout={handleLogout} />
      
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(isAdmin ? '/admin/teams' : '/manager/team')}
              iconName="ArrowLeft"
              iconPosition="left"
              className="mb-4"
            >
              Back to Team
            </Button>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isManager ? 'My Team Expenses' : 'Team Expenses'}
                </h1>
                <p className="text-gray-600 mt-2">
                  {isManager 
                    ? 'View and manage your Engineering team expense submissions'
                    : 'View and manage all team expense submissions'}
                </p>
              </div>
              <Button
                variant="default"
                iconName="Download"
                iconPosition="left"
              >
                Export Report
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="DollarSign" size={24} className="text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Total Amount</p>
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
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">ID</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Employee</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Description</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Category</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense, index) => (
                    <motion.tr
                      key={expense.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/expense/${expense.id}`)}
                    >
                      <td className="py-4 px-6">
                        <span className="font-medium text-blue-600">{expense.id}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{expense.employee.name}</p>
                          <p className="text-sm text-gray-600">{expense.merchant}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-gray-900 max-w-xs truncate">{expense.description}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-700">{expense.category}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-700">{formatDate(expense.date)}</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <CurrencyDisplay
                          amount={expense.amount}
                          currency={expense.currency}
                          size="sm"
                          showConverted={false}
                        />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <StatusBadge status={expense.status} size="sm" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="Eye"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/expense/${expense.id}`);
                          }}
                        />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredExpenses.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Receipt" size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileBottomNavigation user={currentUser} notificationCount={5} />
    </div>
  );
};

export default TeamExpensesPage;
